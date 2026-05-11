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

    /* ── Hjälpfunktioner ──────────────────────────────────────────── */

    function currentPageFile() {
        var seg = (window.location.pathname || "").split("/").pop() || "";
        try { seg = decodeURIComponent(seg); } catch (e) {}
        return seg.toLowerCase();
    }

    function normalizeHref(href) {
        var h = String(href || "");
        var q = h.indexOf("?"); if (q >= 0) h = h.substring(0, q);
        var hash = h.indexOf("#"); if (hash >= 0) h = h.substring(0, hash);
        var file = h.split("/").pop() || "";
        try { file = decodeURIComponent(file); } catch (e) {}
        return file.toLowerCase();
    }

    /* ── Initiera header efter att HTML laddats ───────────────────── */

    function initHeader(header) {
        /* Anpassa logo-länken: på startsidan pekar den till #hem, annars till putsad.html#hem */
        var logo = header.querySelector("#site-logo");
        if (logo) {
            logo.href = currentPageFile() === "putsad.html" ? "#hem" : "putsad.html#hem";
        }

        /* Ersätt platshållaren med den riktiga headern */
        mount.replaceWith(header);

        /* Markera aktiv sida */
        var cur = currentPageFile();
        header.querySelectorAll("nav.nav-desktop a:not(.btn-cta), #mobile-menu-panel a")
            .forEach(function (a) {
                if (normalizeHref(a.getAttribute("href")) === cur) {
                    a.setAttribute("aria-current", "page");
                }
            });

        /* Mobilmeny */
        var toggle = document.getElementById("nav-toggle");
        var panel  = document.getElementById("mobile-menu-panel");
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
            link.addEventListener("click", function () { setOpen(false); });
        });
    }

    /* ── Hämta header-filen ───────────────────────────────────────── */

    fetch("includes/header.html")
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
