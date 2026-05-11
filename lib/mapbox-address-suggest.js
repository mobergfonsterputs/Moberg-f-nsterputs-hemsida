/**
 * Delad logik för adressförslag (Mapbox Geocoding via server).
 * Anropas från Netlify Function och kan återanvändas av annan Node-host.
 */
"use strict";

const RATE_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;
const ipBuckets = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const key = String(ip || "unknown");
  const bucket = ipBuckets.get(key) || [];
  const recent = bucket.filter((ts) => now - ts < RATE_WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterMs = RATE_WINDOW_MS - (now - recent[0]);
    ipBuckets.set(key, recent);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }
  recent.push(now);
  ipBuckets.set(key, recent);
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * @param {{ method: string, query: string, clientIp: string, mapboxToken?: string | null }} opts
 * @returns {Promise<{ statusCode: number, json: object }>}
 */
async function handleAddressSuggest(opts) {
  const method = String(opts.method || "GET").toUpperCase();
  if (method !== "GET") {
    return { statusCode: 405, json: { error: "Method not allowed" } };
  }

  const rate = checkRateLimit(opts.clientIp);
  if (!rate.allowed) {
    return {
      statusCode: 429,
      json: {
        error: "Too many requests",
        retry_after_seconds: rate.retryAfterSeconds,
      },
    };
  }

  const query = String(opts.query || "").trim();
  if (query.length < 2) {
    return { statusCode: 400, json: { error: "Query is too short" } };
  }
  if (query.length > 120) {
    return { statusCode: 400, json: { error: "Query is too long" } };
  }

  const apiToken = opts.mapboxToken ? String(opts.mapboxToken).trim() : "";
  if (!apiToken) {
    return {
      statusCode: 503,
      json: { error: "Address search is not configured (missing MAPBOX_API_TOKEN)" },
    };
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
      return { statusCode: 502, json: { error: "Address provider error" } };
    }
    const data = await upstream.json();
    const features = Array.isArray(data.features) ? data.features : [];
    return {
      statusCode: 200,
      json: {
        features: features.map((f) => ({
          id: f.id,
          text: f.text,
          text_sv: f.text_sv,
          place_name: f.place_name,
          place_name_sv: f.place_name_sv,
          context: f.context,
        })),
      },
    };
  } catch (e) {
    return { statusCode: 502, json: { error: "Address provider unavailable" } };
  }
}

module.exports = { handleAddressSuggest, checkRateLimit };
