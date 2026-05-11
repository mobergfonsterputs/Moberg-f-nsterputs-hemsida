"use strict";

const crypto = require("crypto");

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 25;
const failureBuckets = new Map();

function clientIpFromEvent(event) {
  const xf = event.headers["x-forwarded-for"] || event.headers["X-Forwarded-For"];
  if (typeof xf === "string" && xf.length) {
    return xf.split(",")[0].trim();
  }
  return event.headers["client-ip"] || event.headers["Client-Ip"] || "unknown";
}

function recentFailureCount(ip) {
  const now = Date.now();
  const key = String(ip || "unknown");
  const bucket = failureBuckets.get(key) || [];
  const recent = bucket.filter((ts) => now - ts < WINDOW_MS);
  failureBuckets.set(key, recent);
  return recent.length;
}

function recordAuthFailure(ip) {
  const now = Date.now();
  const key = String(ip || "unknown");
  const recent = failureBuckets.get(key) || [];
  recent.push(now);
  failureBuckets.set(
    key,
    recent.filter((ts) => now - ts < WINDOW_MS)
  );
}

function sha256utf8(s) {
  return crypto.createHash("sha256").update(String(s || ""), "utf8").digest();
}

function verifyPassword(provided, expected) {
  try {
    return crypto.timingSafeEqual(sha256utf8(provided), sha256utf8(expected));
  } catch (e) {
    return false;
  }
}

exports.handler = async function (event) {
  const cors = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...cors, Allow: "POST, OPTIONS" },
      body: JSON.stringify({ ok: false, error: "Method not allowed" }),
    };
  }

  const ip = clientIpFromEvent(event);
  if (recentFailureCount(ip) >= MAX_FAILURES) {
    return {
      statusCode: 429,
      headers: cors,
      body: JSON.stringify({ ok: false, error: "Too many attempts" }),
    };
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || String(expected).length < 8) {
    return {
      statusCode: 503,
      headers: cors,
      body: JSON.stringify({
        ok: false,
        error: "Admin is not configured (set ADMIN_PASSWORD in Netlify, min 8 characters)",
      }),
    };
  }

  let body = {};
  try {
    const raw = event.body || "{}";
    if (raw.length > 2000) {
      return {
        statusCode: 400,
        headers: cors,
        body: JSON.stringify({ ok: false, error: "Body too large" }),
      };
    }
    body = JSON.parse(raw);
  } catch (e) {
    recordAuthFailure(ip);
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ ok: false, error: "Invalid JSON" }),
    };
  }

  const password = body.password;
  if (typeof password !== "string") {
    recordAuthFailure(ip);
    return {
      statusCode: 401,
      headers: cors,
      body: JSON.stringify({ ok: false }),
    };
  }

  if (verifyPassword(password, expected)) {
    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({ ok: true }),
    };
  }

  recordAuthFailure(ip);
  return {
    statusCode: 401,
    headers: cors,
    body: JSON.stringify({ ok: false }),
  };
};
