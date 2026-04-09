/**
 * Delade priser för putsad.html och berakna-pris.html (hero-kalkylatorn).
 * Admin: admin-priser.html sparar till localStorage under putsad_price_calc_prices_v1.
 */
(function (global) {
    var STORAGE_KEY = "putsad_price_calc_prices_v1";

    var DEFAULTS = {
        vanligt_enkel: 38,
        vanligt_dubbel: 68,
        sprojs_enkel: 56,
        sprojs_dubbel: 86,
        extra_stor: 76
    };

    function clampPrice(n) {
        n = Number(n);
        if (isNaN(n) || n < 0) return 0;
        if (n > 999999) return 999999;
        return Math.round(n);
    }

    function getPriceTable() {
        var t = {};
        var k;
        for (k in DEFAULTS) {
            if (Object.prototype.hasOwnProperty.call(DEFAULTS, k)) {
                t[k] = DEFAULTS[k];
            }
        }
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return t;
            var parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object") return t;
            for (k in DEFAULTS) {
                if (Object.prototype.hasOwnProperty.call(parsed, k)) {
                    t[k] = clampPrice(parsed[k]);
                }
            }
        } catch (e) {}
        return t;
    }

    function savePriceTable(table) {
        var out = {};
        var k;
        for (k in DEFAULTS) {
            if (Object.prototype.hasOwnProperty.call(DEFAULTS, k)) {
                out[k] = clampPrice(table[k]);
            }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
        return out;
    }

    global.putsadPriceCalcPricesKey = STORAGE_KEY;
    global.putsadPriceCalcDefaults = DEFAULTS;
    global.putsadGetPriceTable = getPriceTable;
    global.putsadSavePriceTable = savePriceTable;
})(typeof window !== "undefined" ? window : this);
