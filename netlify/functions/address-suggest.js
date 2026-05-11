"use strict";

const { handleAddressSuggest } = require("../../lib/mapbox-address-suggest");

function clientIpFromEvent(event) {
  const xf = event.headers["x-forwarded-for"] || event.headers["X-Forwarded-For"];
  if (typeof xf === "string" && xf.length) {
    return xf.split(",")[0].trim();
  }
  return event.headers["client-ip"] || event.headers["Client-Ip"] || "unknown";
}

exports.handler = async function (event) {
  const jsonHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=60, s-maxage=60",
  };

  try {
    const q =
      (event.queryStringParameters && event.queryStringParameters.q) ||
      (event.multiValueQueryStringParameters &&
        event.multiValueQueryStringParameters.q &&
        event.multiValueQueryStringParameters.q[0]) ||
      "";

    const result = await handleAddressSuggest({
      method: event.httpMethod,
      query: q,
      clientIp: clientIpFromEvent(event),
      mapboxToken: process.env.MAPBOX_API_TOKEN,
    });

    return {
      statusCode: result.statusCode,
      headers: jsonHeaders,
      body: JSON.stringify(result.json),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Internal error" }),
    };
  }
};
