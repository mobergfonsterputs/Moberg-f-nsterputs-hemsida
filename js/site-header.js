/**
 * Gemensamt sidhuvud: injicerar <header> i <div data-site-header></div> direkt (ingen fetch — undviker fördröjning).
 * Markup ska matcha includes/header.html (uppdatera båda vid ändring).
 */
(function () {
    "use strict";

    var mount = document.querySelector("[data-site-header]");
    if (!mount) return;

    /* ── Samma HTML som includes/header.html ───────────────────────── */
    var HEADER_MARKUP =
        '<header class="site-chrome-header">' +
        '<div class="header-inner">' +
        '<a href="putsad.html#hem" class="logo-fallback" id="site-logo">Moberg Fönsterputs</a>' +
        '<nav class="nav-desktop" aria-label="Huvudmeny">' +
        "<ul>" +
        '<li><a href="putsad.html#hem">Hem</a></li>' +
        '<li><a href="sa-funkar-det.html">Så funkar det</a></li>' +
        '<li><a href="detta-ingar.html">Detta ingår</a></li>' +
        '<li><a href="putsad.html#kontakt">Kontakt</a></li>' +
        '<li><a href="berakna-pris.html" class="btn-cta">Boka puts</a></li>' +
        "</ul>" +
        "</nav>" +
        '<div class="header-mobile">' +
        '<a href="berakna-pris.html" class="btn-cta">Boka puts</a>' +
        '<button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="mobile-menu-panel" aria-label="Öppna meny">' +
        '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
        "</svg>" +
        "</button>" +
        "</div>" +
        "</div>" +
        '<div class="mobile-menu-panel" id="mobile-menu-panel" role="navigation" aria-label="Mobilmeny">' +
        '<div class="mobile-menu-inner">' +
        "<ul>" +
        '<li><a href="putsad.html#hem">Hem</a></li>' +
        '<li><a href="sa-funkar-det.html">Så funkar det</a></li>' +
        '<li><a href="detta-ingar.html">Detta ingår</a></li>' +
        '<li><a href="putsad.html#kontakt">Kontakt</a></li>' +
        "</ul>" +
        "</div>" +
        "</div>" +
        "</header>";

    function pathnameFilename() {
        var pathname = window.location.pathname || "";
        var seg = pathname.split("/").filter(Boolean).pop() || "";
        try {
            seg = decodeURIComponent(seg);
        } catch (e) {}
        return String(seg).toLowerCase();
    }

    function pathStemFromFilename(filename) {
        var s = String(filename || "").toLowerCase();
        if (!s || s === "index.html" || s === "index") return "putsad";
        if (s.endsWith(".html")) return s.slice(0, -5);
        return s;
    }

    function currentPageStem() {
        return pathStemFromFilename(pathnameFilename());
    }

    function currentHashLower() {
        return String(window.location.hash || "").toLowerCase();
    }

    function isCurrentNavLink(href) {
        try {
            var u = new URL(String(href || ""), window.location.href);
            var linkPath = (u.pathname || "/").toLowerCase();
            var linkFile = linkPath.split("/").filter(Boolean).pop() || "";
            var linkStem = pathStemFromFilename(linkFile);
            var linkHash = String(u.hash || "").toLowerCase();

            var curStem = currentPageStem();
            var curHash = currentHashLower();

            if (linkStem !== curStem) return false;

            if (linkStem !== "putsad") return true;

            if (!linkHash || linkHash === "#hem") {
                return !curHash || curHash === "#hem";
            }
            return linkHash === curHash;
        } catch (e) {
            return false;
        }
    }

    function initHeader(header) {
        var logo = header.querySelector("#site-logo");
        if (logo) {
            if (currentPageStem() === "putsad") {
                logo.setAttribute("href", "#hem");
            } else {
                logo.setAttribute("href", "putsad.html#hem");
            }
        }

        mount.replaceWith(header);

        header.querySelectorAll("nav.nav-desktop a:not(.btn-cta), #mobile-menu-panel a").forEach(function (a) {
            if (isCurrentNavLink(a.getAttribute("href"))) {
                a.setAttribute("aria-current", "page");
            }
        });

        var toggle = document.getElementById("nav-toggle");
        var panel = document.getElementById("mobile-menu-panel");
        if (!toggle || !panel) return;

        function setOpen(open) {
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            toggle.setAttribute("aria-label", open ? "Stäng meny" : "Öppna meny");
            panel.classList.toggle("is-open", open);
        }

        toggle.addEventListener("click", function () {
            setOpen(!panel.classList.contains("is-open"));
        });

        panel.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                setOpen(false);
            });
        });
    }

    try {
        var tmp = document.createElement("div");
        tmp.innerHTML = HEADER_MARKUP.trim();
        var header = tmp.querySelector("header.site-chrome-header");
        if (header) initHeader(header);
    } catch (e) {}
})();
