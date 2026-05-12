/**
 * Laddar headern från includes/header.html (single source of truth för markup).
 * Injicerar <header> i stället för <div data-site-header></div>.
 * Markerar aktiv nav-länk och initierar mobilmeny.
 *
 * Används: <div data-site-header></div><script src="js/site-header.js"></script>
 */
(function () {
    "use strict";

    var mount = document.querySelector("[data-site-header]");
    if (!mount) return;

    function pathnameFilename() {
        var pathname = window.location.pathname || "";
        var seg = pathname.split("/").filter(Boolean).pop() || "";
        try {
            seg = decodeURIComponent(seg);
        } catch (e) {}
        return String(seg).toLowerCase();
    }

    /** Filnamn utan .html, index → startsida */
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

    /** True om denna nav-länk motsvarar aktuell sida (stöd för pretty URL och ankare på putsad). */
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

    var headerUrl = new URL("includes/header.html", window.location.href).toString();
    fetch(headerUrl)
        .then(function (res) {
            if (!res.ok) throw new Error("Kunde inte ladda header: " + res.status);
            return res.text();
        })
        .then(function (html) {
            var tmp = document.createElement("div");
            tmp.innerHTML = html.trim();
            var header = tmp.querySelector("header");
            if (!header) throw new Error("Ingen <header> hittades i includes/header.html");
            initHeader(header);
        })
        .catch(function () {});
})();
