        const { useEffect, useMemo, useState } = React;

        const WEEKDAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
        const ADMIN_STORAGE_KEY = "putsad_admin_calendar_v1";
        const BOOKED_STORAGE_KEY = "putsad_booked_times_v1";
        const PERSON_STORAGE_KEY = "putsad_personuppgifter_v1";
        const TIME_OPTIONS = Array.from({ length: 14 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);
        const AREA_LABELS = {
            "upplands vasby": "Upplands Väsby",
            "sollentuna": "Sollentuna",
            "taby": "Täby",
            "vasteras": "Västerås",
            "gaddeholm": "Gäddeholm",
            "gaddeholm i vasteras": "Gäddeholm i Västerås",
            "lidkoping": "Lidköping",
            "kollandso": "Kållandsö",
            "bjorkfors": "Björkfors",
            "uppsala": "Uppsala"
        };

        function toDateKey(date) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            return `${y}-${m}-${d}`;
        }

        function toSwedishDate(date) {
            return date.toLocaleDateString("sv-SE", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        }

        function parseDateKey(dateKey) {
            const m = String(dateKey || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (!m) return null;
            const y = Number(m[1]);
            const mo = Number(m[2]) - 1;
            const d = Number(m[3]);
            if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
            const parsed = new Date(y, mo, d);
            if (Number.isNaN(parsed.getTime())) return null;
            if (toDateKey(parsed) !== dateKey) return null;
            return parsed;
        }

        function normalizeWeekday(date) {
            return (date.getDay() + 6) % 7;
        }

        function getSlotsFromAdmin(areaData, dateKey) {
            if (!areaData) return [];
            const hasDate = Array.isArray(areaData.dates) && areaData.dates.includes(dateKey);
            if (!hasDate) return [];
            const source = areaData.timesByDate && Array.isArray(areaData.timesByDate[dateKey])
                ? areaData.timesByDate[dateKey]
                : TIME_OPTIONS;
            return source.filter((t) => TIME_OPTIONS.includes(t)).sort();
        }

        function getBookingContext() {
            const params = new URLSearchParams(window.location.search);
            const context = {
                price: Number(params.get("price")),
                area: params.get("area") || "",
                date: params.get("date") || "",
                time: params.get("time") || ""
            };

            try {
                const personRaw = localStorage.getItem(PERSON_STORAGE_KEY);
                const person = personRaw ? JSON.parse(personRaw) : null;
                if ((!context.area || !(context.area in AREA_LABELS)) && person && person.areaKey) {
                    context.area = String(person.areaKey);
                }
                if (!Number.isFinite(context.price) || context.price < 0) {
                    context.price = Number(localStorage.getItem("putsad_latest_total"));
                }
            } catch (e) {}

            if (!Number.isFinite(context.price) || context.price < 0) context.price = NaN;
            return context;
        }

        function getAdminAvailability() {
            try {
                const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
                const parsed = raw ? JSON.parse(raw) : null;
                if (parsed && parsed.areas && typeof parsed.areas === "object") return parsed.areas;
            } catch (e) {}
            return {};
        }

        function getBookedTimes() {
            try {
                const raw = localStorage.getItem(BOOKED_STORAGE_KEY);
                const parsed = raw ? JSON.parse(raw) : [];
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                return [];
            }
        }

        function useEstimatedHours(price) {
            return useMemo(() => {
                if (!Number.isFinite(price) || price <= 0) return null;
                const hours = price / 500;
                return Math.ceil(hours * 2) / 2;
            }, [price]);
        }

        function formatEstimatedDuration(hoursRoundedHalf) {
            if (!Number.isFinite(hoursRoundedHalf) || hoursRoundedHalf <= 0) return null;
            const wholeHours = Math.floor(hoursRoundedHalf);
            const hasHalf = Math.abs(hoursRoundedHalf - wholeHours - 0.5) < 0.001;
            if (hasHalf) {
                if (wholeHours <= 0) return "30 min";
                return `${wholeHours} h och 30 min`;
            }
            return `${wholeHours} h`;
        }

        function toMinutes(timeValue) {
            const m = String(timeValue || "").match(/^(\d{1,2}):(\d{2})$/);
            if (!m) return null;
            return Number(m[1]) * 60 + Number(m[2]);
        }

        function toClockText(totalMinutes) {
            const h = Math.floor(totalMinutes / 60);
            const m = totalMinutes % 60;
            return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        }

        function toSlotLabelClock(totalMinutes) {
            const clock = toClockText(totalMinutes);
            return clock.endsWith(":00") ? clock.slice(0, 2) : clock;
        }

        function buildDurationSlots(durationHours) {
            if (!Number.isFinite(durationHours) || durationHours <= 0) return [];
            const stepMinutes = Math.round(durationHours * 60);
            if (stepMinutes <= 0) return [];
            const slots = [];
            const firstStart = 8 * 60;
            const lastStart = 18 * 60;
            for (let start = firstStart; start <= lastStart; start += 60) {
                const end = start + stepMinutes;
                slots.push({
                    start: toClockText(start),
                    label: `${toSlotLabelClock(start)} - ${toSlotLabelClock(end)}`
                });
            }
            return slots;
        }

        function BookingCalendar({ embedded = false }) {
            const [refreshToken, setRefreshToken] = useState(0);
            const bookingContext = useMemo(getBookingContext, []);
            const adminAreas = useMemo(getAdminAvailability, [refreshToken]);
            const bookedTimes = useMemo(getBookedTimes, [refreshToken]);
            const customerArea = bookingContext.area || "";
            const estimatedHours = useEstimatedHours(bookingContext.price);
            const estimatedDurationText = useMemo(() => {
                const t = formatEstimatedDuration(estimatedHours);
                return t == null ? "" : t;
            }, [estimatedHours]);

            const areaData = useMemo(() => adminAreas[customerArea] || null, [adminAreas, customerArea]);
            const availableDateSet = useMemo(() => {
                const dates = areaData && Array.isArray(areaData.dates) ? areaData.dates : [];
                return new Set(dates);
            }, [areaData]);
            const bookedStartSet = useMemo(() => {
                const set = new Set();
                bookedTimes.forEach((booking) => {
                    if (!booking) return;
                    if (String(booking.area || "").trim() !== customerArea) return;
                    const dateKey = String(booking.date || "").trim();
                    const timeKey = String(booking.time || "").trim();
                    if (!dateKey || !TIME_OPTIONS.includes(timeKey)) return;
                    set.add(`${dateKey}|${timeKey}`);
                });
                return set;
            }, [bookedTimes, customerArea]);
            const preselectedDate = useMemo(() => {
                const parsed = parseDateKey(bookingContext.date);
                if (!parsed) return null;
                return availableDateSet.has(bookingContext.date) ? parsed : null;
            }, [bookingContext.date, availableDateSet]);

            const currentMonthStart = useMemo(() => {
                const now = new Date();
                return new Date(now.getFullYear(), now.getMonth(), 1);
            }, []);
            const [cursorMonth, setCursorMonth] = useState(() => currentMonthStart);
            const [selectedDate, setSelectedDate] = useState(preselectedDate);
            const [selectedTime, setSelectedTime] = useState(
                TIME_OPTIONS.includes(bookingContext.time) ? bookingContext.time : ""
            );
            useEffect(() => {
                function onStorage(e) {
                    if (!e) return;
                    if (e.key === ADMIN_STORAGE_KEY || e.key === BOOKED_STORAGE_KEY) {
                        setRefreshToken((v) => v + 1);
                    }
                }
                window.addEventListener("storage", onStorage);
                return () => window.removeEventListener("storage", onStorage);
            }, []);

            const canGoToPreviousMonth = useMemo(
                () => cursorMonth > currentMonthStart,
                [cursorMonth, currentMonthStart]
            );

            const monthLabel = cursorMonth.toLocaleDateString("sv-SE", { month: "long", year: "numeric" });

            const monthMatrix = useMemo(() => {
                const year = cursorMonth.getFullYear();
                const month = cursorMonth.getMonth();
                const first = new Date(year, month, 1);
                const last = new Date(year, month + 1, 0);
                const lead = normalizeWeekday(first);
                const totalDays = last.getDate();
                const cells = [];
                for (let i = 0; i < lead; i += 1) cells.push(null);
                for (let d = 1; d <= totalDays; d += 1) cells.push(new Date(year, month, d));
                while (cells.length % 7 !== 0) cells.push(null);
                return cells;
            }, [cursorMonth]);

            const availableStartsByDate = useMemo(() => {
                const map = new Map();
                if (!areaData) return map;
                availableDateSet.forEach((dateKey) => {
                    const starts = getSlotsFromAdmin(areaData, dateKey).filter((start) => !bookedStartSet.has(`${dateKey}|${start}`));
                    map.set(dateKey, starts);
                });
                return map;
            }, [areaData, availableDateSet, bookedStartSet]);

            const isDateAvailable = (date) => availableDateSet.has(toDateKey(date));
            const monthHasAvailability = useMemo(() => {
                const year = cursorMonth.getFullYear();
                const month = cursorMonth.getMonth();
                for (const key of availableDateSet) {
                    const parts = key.split("-");
                    if (parts.length !== 3) continue;
                    const y = Number(parts[0]);
                    const m = Number(parts[1]) - 1;
                    if (y === year && m === month) {
                        const starts = availableStartsByDate.get(key) || [];
                        if (starts.length) return true;
                    }
                }
                return false;
            }, [availableDateSet, availableStartsByDate, cursorMonth]);
            const selectedSlots = useMemo(() => {
                if (!selectedDate) return [];
                const dateKey = toDateKey(selectedDate);
                const hasAvailability = availableDateSet.has(dateKey);
                if (!hasAvailability) return [];
                const slots = buildDurationSlots(estimatedHours);
                const allowedStarts = new Set(availableStartsByDate.get(dateKey) || []);
                return slots.filter((slot) => allowedStarts.has(slot.start));
            }, [selectedDate, availableDateSet, availableStartsByDate, estimatedHours]);
            const selectedKey = selectedDate ? toDateKey(selectedDate) : "";
            const normalizedSelectedTime = selectedSlots.some((slot) => slot.start === selectedTime) ? selectedTime : "";

            function buildStepUrl(step) {
                if (step === 1) return embedded ? "sa-funkar-det.html#price-calc-heading" : "putsad.html#pris-kalkylator";
                if (step === 2) {
                    return "adress.html";
                }
                if (step === 3) {
                    const params = new URLSearchParams();
                    if (Number.isFinite(bookingContext.price) && bookingContext.price > 0) params.set("price", String(bookingContext.price));
                    if (customerArea) params.set("area", customerArea);
                    if (selectedDate) params.set("date", selectedKey);
                    if (normalizedSelectedTime) params.set("time", normalizedSelectedTime);
                    const q = params.toString();
                    if (embedded) return "sa-funkar-det.html#inline-booking-anchor" + (q ? "?" + q : "");
                    return "boka-tid.html" + (q ? "?" + q : "");
                }
                if (step === 4) {
                    const params = new URLSearchParams();
                    if (selectedDate) params.set("date", selectedKey);
                    if (normalizedSelectedTime) params.set("time", normalizedSelectedTime);
                    if (Number.isFinite(bookingContext.price) && bookingContext.price > 0) params.set("price", String(bookingContext.price));
                    if (customerArea) params.set("area", customerArea);
                    const q = params.toString();
                    return "paket-vald.html" + (q ? "?" + q : "");
                }
                if (step === 5) {
                    const params = new URLSearchParams();
                    if (selectedDate) params.set("date", selectedKey);
                    if (normalizedSelectedTime) params.set("time", normalizedSelectedTime);
                    if (Number.isFinite(bookingContext.price) && bookingContext.price > 0) params.set("price", String(bookingContext.price));
                    if (customerArea) params.set("area", customerArea);
                    const q = params.toString();
                    return "bekrafta.html" + (q ? "?" + q : "");
                }
                return "boka-tid.html";
            }

            return (
                <div className="px-5 pb-0">
                    <div className="top-nav">
                        <a
                            className="back-link"
                            href={embedded ? "#price-calc-heading" : "adress.html"}
                            aria-label="Tillbaka"
                        >
                            <span className="back-link-icon" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M14.5 6.5L9 12l5.5 5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <span className="back-link-text">Tillbaka</span>
                        </a>
                        <section className="booking-progress" aria-label="Bokningssteg">
                                <div className="booking-progress-track" aria-hidden="true">
                                <div className="booking-progress-fill"></div>
                                <div className="booking-progress-dots">
                                    <span className="booking-progress-dot is-complete" style={{ left: "0%" }} onClick={() => { window.location.href = buildStepUrl(1); }} title="Beräkna pris"></span>
                                    <span className="booking-progress-dot is-complete" style={{ left: "25%" }} onClick={() => { window.location.href = buildStepUrl(2); }} title="Adress"></span>
                                    <span className="booking-progress-dot is-active" style={{ left: "50%" }} onClick={() => { window.location.href = buildStepUrl(3); }} title="Boka tid"></span>
                                    <span className="booking-progress-dot" style={{ left: "75%" }} onClick={() => { window.location.href = buildStepUrl(4); }} title="Personuppgifter"></span>
                                    <span className="booking-progress-dot" style={{ left: "100%" }} onClick={() => { window.location.href = buildStepUrl(5); }} title="Bekräfta"></span>
                                </div>
                            </div>
                            <div className="booking-progress-steps">
                                <div className="booking-progress-step is-complete" style={{ left: "0%" }}>Beräkna pris</div>
                                <div className="booking-progress-step is-complete" style={{ left: "25%" }}>Adress</div>
                                <div className="booking-progress-step is-active" style={{ left: "50%" }}>Boka tid</div>
                                <div className="booking-progress-step" style={{ left: "75%" }}>Personuppgifter</div>
                                <div className="booking-progress-step" style={{ left: "100%" }}>Bekräfta</div>
                            </div>
                        </section>
                    </div>
                    <div className="mx-auto w-full max-w-5xl">
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                            {!selectedDate ? (
                                <>
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">Boka tid</h1>
                                        <div className="flex shrink-0 items-center gap-3 -translate-x-[60px] translate-y-[30px]">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!canGoToPreviousMonth) return;
                                                    setCursorMonth(new Date(cursorMonth.getFullYear(), cursorMonth.getMonth() - 1, 1));
                                                }}
                                                disabled={!canGoToPreviousMonth}
                                                className={
                                                    "inline-flex h-[54px] min-h-[54px] w-[54px] min-w-[54px] items-center justify-center rounded-lg border border-slate-200 " +
                                                    (canGoToPreviousMonth ? "hover:bg-slate-50" : "cursor-not-allowed opacity-45")
                                                }
                                                aria-label="Föregående månad"
                                            >
                                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                    <path d="M14.5 6.5L9 12l5.5 5.5" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                            <span className="h-7 w-px rounded-full bg-slate-300" aria-hidden="true"></span>
                                            <button
                                                type="button"
                                                onClick={() => setCursorMonth(new Date(cursorMonth.getFullYear(), cursorMonth.getMonth() + 1, 1))}
                                                className="inline-flex h-[54px] min-h-[54px] w-[54px] min-w-[54px] items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50"
                                                aria-label="Nästa månad"
                                            >
                                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                    <path d="M9.5 6.5L15 12l-5.5 5.5" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {customerArea ? (
                                        <p className="mb-2 text-sm text-slate-600">
                                            Område: <span className="font-semibold text-slate-800">{AREA_LABELS[customerArea] || customerArea}</span>
                                        </p>
                                    ) : (
                                        <p className="mb-2 text-sm text-amber-700">
                                            Område saknas. Gå tillbaka och välj en giltig adress.
                                        </p>
                                    )}

                                    {estimatedHours && (
                                        <p className="mb-3 text-sm font-medium text-slate-700">
                                            Putsningen kommer att ta ca {estimatedDurationText}.
                                        </p>
                                    )}

                                    <div className="mb-2 text-base font-semibold">
                                        {monthLabel}
                                        {!monthHasAvailability ? " - Det finns tyvärr inga lediga tider denna månad." : ""}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 text-[11px] font-semibold text-slate-500">
                                        {WEEKDAYS.map((d) => <div key={d} className="py-1 text-center">{d}</div>)}
                                    </div>

                                    <div className="mt-1.5 grid grid-cols-7 gap-1">
                                        {monthMatrix.map((date, idx) => {
                                            if (!date) return <div key={`empty-${idx}`} className="h-14 rounded-xl border border-transparent" />;

                                            const key = toDateKey(date);
                                            const isAvailable = isDateAvailable(date) && ((availableStartsByDate.get(key) || []).length > 0);
                                            const isToday = key === toDateKey(new Date());

                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => isAvailable && setSelectedDate(date)}
                                                    disabled={!isAvailable}
                                                    className={
                                                        "h-14 rounded-xl border p-1.5 text-left transition " +
                                                        (isAvailable
                                                            ? "border-slate-200 hover:border-slate-900 hover:bg-slate-50"
                                                            : "cursor-not-allowed border-slate-100 bg-slate-50/60 text-slate-300")
                                                    }
                                                >
                                                    <div className={"text-xs font-semibold " + (isToday ? "text-blue-700" : "")}>{date.getDate()}</div>
                                                    <div className="mt-1">
                                                        {isAvailable ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                                                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                                Lediga tider
                                                            </span>
                                                        ) : (
                                                            <span className="text-[11px]">Inga tider</span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedDate(null);
                                            setSelectedTime("");
                                        }}
                                        className="mb-4 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                                    >
                                        ← Till månadsvy
                                    </button>

                                    <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">Boka tid</h1>
                                    <p className="mt-2 capitalize text-slate-700">{toSwedishDate(selectedDate)}</p>

                                    <div className="mt-4">
                                        {estimatedHours ? (
                                            <h2 className="mb-2 text-base font-semibold tracking-wide text-slate-700 md:text-lg">
                                                Putsningen kommer att ta ca {estimatedDurationText}.
                                            </h2>
                                        ) : null}
                                        {selectedSlots.length ? (
                                            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
                                                {selectedSlots.map((slot) => (
                                                    <button
                                                        key={selectedKey + slot.start}
                                                        type="button"
                                                        onClick={() => setSelectedTime(slot.start)}
                                                        className={
                                                            "rounded-xl border px-3 py-2 text-sm font-semibold transition " +
                                                            (normalizedSelectedTime === slot.start
                                                                ? "border-4 border-[#113768] bg-white text-slate-900"
                                                                : "border-slate-200 hover:border-slate-900 hover:bg-slate-50")
                                                        }
                                                    >
                                                        {slot.label}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500">Inga lediga tider för det här datumet.</p>
                                        )}
                                    </div>

                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            disabled={!normalizedSelectedTime}
                                            onClick={() => {
                                                const params = new URLSearchParams();
                                                params.set("date", selectedKey);
                                                params.set("time", normalizedSelectedTime);
                                                if (Number.isFinite(bookingContext.price) && bookingContext.price > 0) {
                                                    params.set("price", String(bookingContext.price));
                                                }
                                                if (customerArea) params.set("area", customerArea);
                                                window.location.href = "paket-vald.html?" + params.toString();
                                            }}
                                            className={
                                                "h-[50px] w-[260px] rounded-[14px] text-[16px] font-semibold text-white transition " +
                                                (normalizedSelectedTime
                                                    ? "bg-[#113768] hover:bg-[#0d2c52]"
                                                    : "cursor-not-allowed bg-[#113768]/45")
                                            }
                                        >
                                            Nästa
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        function mountBookingCalendar(opts) {
            opts = opts || {};
            var mountId = opts.mountId || "app";
            var embedded = !!opts.embedded;
            var el = document.getElementById(mountId);
            if (!el || typeof ReactDOM === "undefined") return null;
            var root = ReactDOM.createRoot(el);
            root.render(<BookingCalendar embedded={embedded} />);
            return root;
        }
        window.mountBookingCalendar = mountBookingCalendar;