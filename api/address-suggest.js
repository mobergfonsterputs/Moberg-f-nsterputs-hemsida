/**
 * Express/Connect-kompatibel handler för lokal Node-server.
 * På Netlify används netlify/functions/address-suggest.js (samma lib/).
 */
const { handleAddressSuggest } = require("../lib/mapbox-address-suggest");

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

module.exports = async function handler(req, res) {
  const result = await handleAddressSuggest({
    method: req.method,
    query: req.query?.q ?? "",
    clientIp: getClientIp(req),
    mapboxToken: process.env.MAPBOX_API_TOKEN,
  });
  res.status(result.statusCode).json(result.json);
};
