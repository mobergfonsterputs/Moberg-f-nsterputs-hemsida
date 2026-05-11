/**
 * Arkiverar poster som raderats från andra admin-sidor (localStorage).
 * Används av admin-meddelanden, admin-bokade-tider och admin-raderat.
 */
(function (global) {
    "use strict";

    var ARCHIVE_KEY = "putsad_admin_deleted_archive_v1";
    var MAX_ITEMS = 300;

    function readArchive() {
        try {
            var raw = localStorage.getItem(ARCHIVE_KEY);
            var parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function writeArchive(list) {
        try {
            localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list));
        } catch (e) {}
    }

    function pushDeleted(kind, data) {
        if (!data || typeof data !== "object") return;
        var list = readArchive();
        list.unshift({
            id: "arc-" + String(Date.now()) + "-" + String(Math.random()).slice(2, 9),
            kind: String(kind || "okänd"),
            deletedAt: new Date().toISOString(),
            data: data
        });
        if (list.length > MAX_ITEMS) {
            list = list.slice(0, MAX_ITEMS);
        }
        writeArchive(list);
    }

    global.putsadReadDeletedArchive = readArchive;
    global.putsadWriteDeletedArchive = writeArchive;
    global.putsadPushDeleted = pushDeleted;
})(typeof window !== "undefined" ? window : this);
