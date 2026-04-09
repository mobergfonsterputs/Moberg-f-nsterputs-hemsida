const RATE_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;
const ipBuckets = new Map();

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

function checkRateLimit(ip) {
  const now = Date.now();
  const bucket = ipBuckets.get(ip) || [];
  const recent = bucket.filter((ts) => now - ts < RATE_WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterMs = RATE_WINDOW_MS - (now - recent[0]);
    ipBuckets.set(ip, recent);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }
  recent.push(now);
  ipBuckets.set(ip, recent);
  return { allowed: true, retryAfterSeconds: 0 };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return res.status(429).json({
      error: "Too many requests",
      retry_after_seconds: rate.retryAfterSeconds,
    });
  }

  const query = String(req.query?.q || "").trim();
  if (query.length < 2) {
    return res.status(400).json({ error: "Query is too short" });
  }
  if (query.length > 120) {
    return res.status(400).json({ error: "Query is too long" });
  }

  const apiToken = process.env.MAPBOX_API_TOKEN;
  if (!apiToken) {
    return res.status(500).json({ error: "Missing server API token" });
  }

  const mapboxUrl =
    "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
    encodeURIComponent(query) +
    ".json?access_token=" +
    encodeURIComponent(apiToken) +
    "&autocomplete=true&country=se&language=sv&types=address,place,locality,postcode&limit=6";

  try {
    const upstream = await fetch(mapboxUrl);
    if (!upstream.ok) {
      return res.status(502).json({ error: "Address provider error" });
    }
    const data = await upstream.json();
    const features = Array.isArray(data.features) ? data.features : [];
    return res.status(200).json({
      features: features.map((f) => ({
        id: f.id,
        text: f.text,
        text_sv: f.text_sv,
        place_name: f.place_name,
        place_name_sv: f.place_name_sv,
        context: f.context,
      })),
    });
  } catch (err) {
    return res.status(502).json({ error: "Address provider unavailable" });
  }
};

