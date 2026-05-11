/**
 * Adressförslag + serviceområde för putsad.html och adress.html.
 * Delar localStorage-nyckel med bokningsflödet.
 */
(function () {
    "use strict";

    var addressInput = document.getElementById("hero-address-input");
    var suggestionsEl = document.getElementById("hero-address-suggestions");
    var manualAreaSelect =
        document.getElementById("hero-manual-area-select") || document.getElementById("manual-area-select");
    var manualAreaWrap =
        document.querySelector(".hero-manual-area-wrap") || document.querySelector(".manual-area-wrap");
    var serviceMessage = document.getElementById("hero-service-message");
    var nextBtn = document.getElementById("hero-address-next");
    if (!addressInput || !suggestionsEl || !manualAreaSelect || !serviceMessage || !nextBtn) return;

    var isAdressPage = !!document.querySelector("main.adress-page-main");

    var STORAGE_KEY = "putsad_personuppgifter_v1";
    var debounceTimer = null;
    var lastRequestId = 0;
    var selectedFeature = null;
    var selectedAreaKey = "";
    var activeSuggestionIndex = -1;
    var autocompleteDisabledUntil = 0;
    var hadAutocompleteFailure = false;
    var SERVICE_AREA_KEYS = [
        "upplands vasby",
        "sollentuna",
        "taby",
        "vasteras",
        "gaddeholm",
        "gaddeholm i vasteras",
        "lidkoping",
        "kollandso",
        "bjorkfors",
        "uppsala"
    ];
    var serviceAreas = new Set(SERVICE_AREA_KEYS);

    function buildFiveStepUrl(step) {
        if (step === 1) return "putsad.html#pris-kalkylator";
        if (step === 2) return "adress.html";
        if (step === 3) {
            var p3 = new URLSearchParams();
            if (selectedAreaKey) p3.set("area", selectedAreaKey);
            try {
                var pr = localStorage.getItem("putsad_latest_total") || "";
                if (pr && /^\d+$/.test(pr)) p3.set("price", pr);
            } catch (e) {}
            var q3 = p3.toString();
            return "boka-tid.html" + (q3 ? "?" + q3 : "");
        }
        if (step === 4) return "paket-vald.html";
        if (step === 5) return "bekrafta.html";
        return "adress.html";
    }

    document.querySelectorAll(".booking-progress-dot[data-step-index]").forEach(function (dot) {
        dot.addEventListener("click", function () {
            var s = parseInt(dot.getAttribute("data-step-index"), 10);
            if (!s) return;
            window.location.href = buildFiveStepUrl(s);
        });
    });

    function normalize(value) {
        return String(value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function getContextValue(feature, prefix) {
        var context = feature && feature.context ? feature.context : [];
        var found = context.find(function (item) {
            return String(item.id || "").indexOf(prefix + ".") === 0;
        });
        return found ? (found.text_sv || found.text || "") : "";
    }

    function setServiceMessage(text, kind) {
        serviceMessage.textContent = text || "";
        serviceMessage.classList.remove("is-success", "is-error");
        if (kind === "success") serviceMessage.classList.add("is-success");
        if (kind === "error") serviceMessage.classList.add("is-error");
    }

    function setManualFallbackVisible(show) {
        if (!manualAreaWrap) return;
        manualAreaWrap.hidden = !show;
    }

    function setSuggestionsOpen(open) {
        suggestionsEl.classList.toggle("is-open", !!open);
    }

    function clearSuggestions() {
        suggestionsEl.innerHTML = "";
        setSuggestionsOpen(false);
        activeSuggestionIndex = -1;
    }

    function isAddressFilled() {
        return !!String(addressInput.value || "").trim();
    }

    function updateNextVisibility() {
        nextBtn.hidden = !(isAddressFilled() && !!selectedAreaKey);
    }

    function saveAddressState() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            var parsed = raw ? JSON.parse(raw) : {};
            if (!parsed || typeof parsed !== "object") parsed = {};
            parsed.address = addressInput.value || "";
            parsed.selectedFeature = selectedFeature || null;
            parsed.inServiceArea = !!selectedAreaKey;
            parsed.areaKey = selectedAreaKey || "";
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch (e) {}
    }

    function handleFeature(feature) {
        var city =
            getContextValue(feature, "place") ||
            getContextValue(feature, "locality") ||
            getContextValue(feature, "district") ||
            "";
        var sublocality =
            getContextValue(feature, "neighborhood") ||
            getContextValue(feature, "locality") ||
            "";
        var route = (feature && (feature.text_sv || feature.text)) || "";

        var cityKey = normalize(city);
        var subKey = normalize(sublocality);
        var routeKey = normalize(route);
        var combinedKey = normalize(sublocality + " i " + city);
        var routeCombinedKey = normalize(route + " i " + city);
        var candidates = [cityKey, subKey, routeKey, combinedKey, routeCombinedKey].filter(Boolean);
        var matchedArea = candidates.find(function (k) { return serviceAreas.has(k); }) || "";

        selectedAreaKey = matchedArea;
        manualAreaSelect.value = matchedArea || "";

        if (selectedAreaKey) {
            setServiceMessage("Vi putsar i ditt område : )", "success");
        } else {
            setServiceMessage("Vi putsar tyvärr inte i ditt område än : (", "error");
        }
        updateNextVisibility();
        saveAddressState();
    }

    function renderSuggestions(features) {
        suggestionsEl.innerHTML = "";
        activeSuggestionIndex = -1;
        if (!features || !features.length) {
            setSuggestionsOpen(false);
            return;
        }
        features.forEach(function (feature) {
            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "hero-address-suggestion-btn";
            btn.textContent = feature.place_name_sv || feature.place_name || "";
            btn.addEventListener("click", function () {
                selectedFeature = feature;
                addressInput.value = feature.place_name_sv || feature.place_name || "";
                clearSuggestions();
                handleFeature(feature);
            });
            suggestionsEl.appendChild(btn);
        });
        setSuggestionsOpen(true);
    }

    function getSuggestionButtons() {
        return Array.prototype.slice.call(
            suggestionsEl.querySelectorAll(".hero-address-suggestion-btn")
        );
    }

    function setActiveSuggestion(index) {
        var buttons = getSuggestionButtons();
        if (!buttons.length) {
            activeSuggestionIndex = -1;
            return;
        }
        if (index < 0) index = buttons.length - 1;
        if (index >= buttons.length) index = 0;
        activeSuggestionIndex = index;
        buttons.forEach(function (btn, i) {
            var isActive = i === activeSuggestionIndex;
            btn.classList.toggle("is-active", isActive);
            btn.setAttribute("aria-selected", isActive ? "true" : "false");
        });
    }

    function requestSuggestions(query) {
        var requestId = ++lastRequestId;
        var url = "/api/address-suggest?q=" + encodeURIComponent(query);

        function markAutocompleteFailure() {
            hadAutocompleteFailure = true;
            setManualFallbackVisible(true);
            setServiceMessage("Adressförslag fungerar inte just nu. Välj område manuellt i listan nedan.", "error");
        }

        fetch(url)
            .then(function (res) {
                if (res.status === 429) {
                    return res.json().then(function (data) {
                        var retryAfter = Number(data && data.retry_after_seconds) || 60;
                        autocompleteDisabledUntil = Date.now() + retryAfter * 1000;
                        markAutocompleteFailure();
                        clearSuggestions();
                        return null;
                    }).catch(function () {
                        autocompleteDisabledUntil = Date.now() + 60000;
                        markAutocompleteFailure();
                        clearSuggestions();
                        return null;
                    });
                }
                if (res.status === 503) {
                    if (requestId !== lastRequestId) return null;
                    markAutocompleteFailure();
                    clearSuggestions();
                    return null;
                }
                if (!res.ok) return null;
                return res.json();
            })
            .then(function (data) {
                if (requestId !== lastRequestId) return;
                if (!data || !Array.isArray(data.features)) {
                    markAutocompleteFailure();
                    clearSuggestions();
                    return;
                }
                if (!data.features.length) markAutocompleteFailure();
                renderSuggestions(data.features);
            })
            .catch(function () {
                if (requestId !== lastRequestId) return;
                markAutocompleteFailure();
                clearSuggestions();
            });
    }

    function loadSavedState() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            var saved = JSON.parse(raw);
            if (!saved || typeof saved !== "object") return;
            if (saved.address) addressInput.value = saved.address;
            if (saved.areaKey) {
                selectedAreaKey = String(saved.areaKey || "").trim();
                manualAreaSelect.value = selectedAreaKey;
            }
            if (saved.selectedFeature && typeof saved.selectedFeature === "object") {
                selectedFeature = saved.selectedFeature;
                handleFeature(saved.selectedFeature);
            }
        } catch (e) {}
        updateNextVisibility();
    }

    addressInput.addEventListener("input", function () {
        selectedFeature = null;
        if (!manualAreaSelect.value) selectedAreaKey = "";
        if (!hadAutocompleteFailure) setServiceMessage("", "");
        updateNextVisibility();
        saveAddressState();
        clearTimeout(debounceTimer);
        var q = addressInput.value.trim();
        if (q.length < 1) {
            clearSuggestions();
            return;
        }
        if (Date.now() < autocompleteDisabledUntil) {
            setServiceMessage("Adressförslag är tillfälligt pausat. Välj område manuellt i listan nedan.", "error");
            clearSuggestions();
            return;
        }
        debounceTimer = setTimeout(function () {
            requestSuggestions(q);
        }, 400);
    });

    addressInput.addEventListener("keydown", function (e) {
        var hasOpenSuggestions = suggestionsEl.classList.contains("is-open");
        var buttons = hasOpenSuggestions ? getSuggestionButtons() : [];

        if (e.key === "ArrowDown" && buttons.length) {
            e.preventDefault();
            setActiveSuggestion(activeSuggestionIndex + 1);
            return;
        }

        if (e.key === "ArrowUp" && buttons.length) {
            e.preventDefault();
            setActiveSuggestion(activeSuggestionIndex - 1);
            return;
        }

        if (e.key === "Enter" && buttons.length && activeSuggestionIndex >= 0 && buttons[activeSuggestionIndex]) {
            e.preventDefault();
            buttons[activeSuggestionIndex].click();
            return;
        }

        if (e.key === "Escape") {
            clearSuggestions();
        }
    });

    document.addEventListener("click", function (e) {
        if (!e.target.closest(".hero-address-input-wrap")) {
            clearSuggestions();
        }
    });

    manualAreaSelect.addEventListener("change", function () {
        selectedAreaKey = String(manualAreaSelect.value || "").trim();
        if (selectedAreaKey) {
            setServiceMessage("Område valt manuellt. Du kan fortsätta.", "success");
        } else if (!hadAutocompleteFailure) {
            setServiceMessage("", "");
        }
        updateNextVisibility();
        saveAddressState();
    });

    nextBtn.addEventListener("click", function () {
        if (!isAddressFilled() || !selectedAreaKey) {
            setServiceMessage("Fyll i adress och välj område för att fortsätta.", "error");
            return;
        }
        saveAddressState();
        var params = new URLSearchParams();
        if (selectedAreaKey) params.set("area", selectedAreaKey);
        try {
            var pr = localStorage.getItem("putsad_latest_total") || "";
            if (pr && /^\d+$/.test(pr)) params.set("price", pr);
        } catch (e) {}
        var q = params.toString();
        if (isAdressPage) {
            window.location.href = "boka-tid.html" + (q ? "?" + q : "");
        } else {
            window.location.href = "adress.html" + (q ? "?" + q : "");
        }
    });

    loadSavedState();
})();
