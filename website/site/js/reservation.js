/* reservation.js — car reservation form → backend (MongoDB) + WhatsApp
   1) Shows which dates are already booked (confirmed) for this car.
   2) On submit: saves the reservation to the backend as "pending",
      then opens WhatsApp with the message pre-filled — same as before.
   3) If the chosen dates were just confirmed for someone else, the
      backend rejects it and the client is asked to pick new dates.
*/

document.addEventListener('DOMContentLoaded', () => {

    /* ── Change this to the agency's real WhatsApp number ── */
    const WHATSAPP_NUMBER = '212600000000';

    const API_BASE = window.TD_API_BASE || 'http://localhost:5000/api';

    const params = new URLSearchParams(window.location.search);
    const id     = params.get('id');
    const car    = id ? TDData.getCarById(id) : TDData.getCars()[0];

    if (!car) return; // car.js already shows the "not found" message

    const summaryEl = document.getElementById('reservationSummary');
    if (!summaryEl) return;

    function formatDateHuman(value) {
        if (!value) return '—';
        const d = new Date(value);
        if (isNaN(d)) return '—';
        return d.toLocaleString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function getDays() {
        const p = document.getElementById('resPickupDate').value;
        const r = document.getElementById('resReturnDate').value;
        if (!p || !r) return 0;
        const start = new Date(p);
        const end   = new Date(r);
        if (isNaN(start) || isNaN(end) || end <= start) return 0;
        return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    }

    function renderSummary() {
        const days  = getDays();
        const total = days > 0 ? days * car.price : car.price;

        const pickupLoc  = document.getElementById('resPickupLoc').value;
        const returnLoc  = document.getElementById('resReturnLoc').value;
        const pickupDate = document.getElementById('resPickupDate').value;
        const returnDate = document.getElementById('resReturnDate').value;

        summaryEl.innerHTML = `
            <h3 class="rs-heading">Détails De Votre Réservation</h3>
            <div class="rs-car">
                <img src="${car.images[0]}" alt="${car.name}">
                <div>
                    <div class="rs-car-name">${car.name}</div>
                    <div class="rs-car-price"><span>${car.price} €</span> / jour</div>
                </div>
            </div>

            <div class="rs-line"><span>Lieu de prise en charge</span><span>${pickupLoc || '—'}</span></div>
            <div class="rs-line"><span>Lieu de retour</span><span>${returnLoc || '—'}</span></div>
            <div class="rs-line"><span>Départ</span><span>${pickupDate ? formatDateHuman(pickupDate) : '—'}</span></div>
            <div class="rs-line"><span>Retour</span><span>${returnDate ? formatDateHuman(returnDate) : '—'}</span></div>
            <div class="rs-line"><span>Durée</span><span>${days > 0 ? days + ' jour(s)' : '—'}</span></div>

            <div class="rs-total">
                <span>Total estimé</span>
                <span>${total} €</span>
            </div>
            ${days === 0 ? '<p class="rs-placeholder">Renseignez les dates pour voir le total</p>' : ''}
        `;
    }

    renderSummary();

    ['resPickupLoc', 'resReturnLoc'].forEach(fieldId => {
        const el = document.getElementById(fieldId);
        if (el) el.addEventListener('change', renderSummary);
    });

    /* ── Smooth scroll when "Réserver sur WhatsApp" quick link is clicked ── */
    const waLink = document.getElementById('waLink');
    if (waLink) {
        waLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('reservationSection')
                .scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    /* ══════════════════════ AVAILABILITY (confirmed bookings) ══════════════════════ */

    let bookedRanges = []; // [{ pickupDate: Date, returnDate: Date }]

    function rangesOverlap(aStart, aEnd, bStart, bEnd) {
        return aStart < bEnd && aEnd > bStart;
    }

    function isChosenRangeBlocked() {
        const p = document.getElementById('resPickupDate').value;
        const r = document.getElementById('resReturnDate').value;
        if (!p || !r) return false;
        const start = new Date(p);
        const end   = new Date(r);
        if (isNaN(start) || isNaN(end)) return false;
        return bookedRanges.some(b => rangesOverlap(start, end, new Date(b.pickupDate), new Date(b.returnDate)));
    }

    function dateOnly(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

    function isDayBooked(day) {
        return bookedRanges.some(b => {
            const s = dateOnly(new Date(b.pickupDate));
            const e = dateOnly(new Date(b.returnDate));
            return day >= s && day <= e;
        });
    }

    async function loadAvailability() {
        try {
            const res = await fetch(`${API_BASE}/reservations/availability/${encodeURIComponent(car.id)}`);
            if (!res.ok) throw new Error('bad response');
            bookedRanges = await res.json();
            // If the calendar happens to be open already, refresh it so newly
            // loaded booked ranges get disabled right away.
            if (calOverlay && calOverlay.classList.contains('show')) renderCalendarGrid();
        } catch (e) {
            // Backend not reachable — don't block the client, just skip the calendar.
            console.warn('Could not load availability from backend:', e);
        }
    }

    loadAvailability();

    /* ══════════════════════ INTERACTIVE DATE PICKER (calendar modal) ══════════════════════ */

    const TODAY = dateOnly(new Date());

    const calOverlay    = document.getElementById('resCalOverlay');
    const calGrid       = document.getElementById('resCalGrid');
    const calMonthLabel = document.getElementById('resCalMonthLabel');
    const calModalTitle = document.getElementById('resCalModalTitle');
    const calPrevBtn    = document.getElementById('resCalPrev');
    const calNextBtn    = document.getElementById('resCalNext');

    const fieldEls = {
        pickup: {
            btn:    document.getElementById('resPickupDateBtn'),
            label:  document.getElementById('resPickupDateLabel'),
            time:   document.getElementById('resPickupTime'),
            hidden: document.getElementById('resPickupDate'),
            title:  'la date de départ',
            date:   null
        },
        return: {
            btn:    document.getElementById('resReturnDateBtn'),
            label:  document.getElementById('resReturnDateLabel'),
            time:   document.getElementById('resReturnTime'),
            hidden: document.getElementById('resReturnDate'),
            title:  'la date de retour',
            date:   null
        }
    };

    let activeField = null;
    let calYear  = TODAY.getFullYear();
    let calMonth = TODAY.getMonth();

    /* Build the "07:00 → 22:00 every 30 min" time options, disabling past
       times when the chosen day is today (based on the visitor's own clock). */
    function populateTimeSelect(field) {
        const f = fieldEls[field];
        const isToday = f.date && dateOnly(f.date).getTime() === TODAY.getTime();
        const now = new Date();
        const previousValue = f.time.value;

        let html = `<option value="">--:--</option>`;
        for (let h = 7; h <= 22; h++) {
            for (const m of [0, 30]) {
                if (h === 22 && m === 30) continue;
                const past = isToday && (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes()));
                const hh = String(h).padStart(2, '0');
                const mm = String(m).padStart(2, '0');
                const val = `${hh}:${mm}`;
                html += `<option value="${val}"${past ? ' disabled' : ''}>${val}</option>`;
            }
        }
        f.time.innerHTML = html;

        // Keep the previous choice selected if it's still valid, else reset.
        if (previousValue && [...f.time.options].some(o => o.value === previousValue && !o.disabled)) {
            f.time.value = previousValue;
        } else {
            f.time.value = '';
        }
    }

    populateTimeSelect('pickup');
    populateTimeSelect('return');

    function isDisabledDay(day, field) {
        if (day < TODAY) return true;
        if (isDayBooked(day)) return true;
        if (field === 'return' && fieldEls.pickup.date && day < dateOnly(fieldEls.pickup.date)) return true;
        return false;
    }

    function renderCalendarGrid() {
        if (!activeField) return;
        const first      = new Date(calYear, calMonth, 1);
        const startDow   = (first.getDay() + 6) % 7; // Monday-first
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

        calMonthLabel.textContent = first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

        // Can't navigate to a month before the current one.
        calPrevBtn.disabled = (calYear === TODAY.getFullYear() && calMonth === TODAY.getMonth());

        let cells = '';
        for (let i = 0; i < startDow; i++) cells += `<div class="res-cal-day empty"></div>`;

        for (let d = 1; d <= daysInMonth; d++) {
            const day      = new Date(calYear, calMonth, d);
            const booked   = isDayBooked(day);
            const disabled = isDisabledDay(day, activeField);
            const isToday  = day.getTime() === TODAY.getTime();
            const selDate  = fieldEls[activeField].date;
            const selected = selDate && day.getTime() === dateOnly(selDate).getTime();

            const classes = ['res-cal-day'];
            if (disabled) classes.push('disabled');
            if (booked)   classes.push('booked');
            if (isToday)  classes.push('today');
            if (selected) classes.push('selected');

            cells += `<div class="${classes.join(' ')}" data-day="${d}" title="${booked ? 'Indisponible' : ''}">${d}</div>`;
        }

        calGrid.innerHTML = cells;

        calGrid.querySelectorAll('.res-cal-day:not(.empty):not(.disabled)').forEach(cell => {
            cell.addEventListener('click', () => {
                const d = parseInt(cell.dataset.day, 10);
                selectDay(new Date(calYear, calMonth, d));
            });
        });
    }

    function selectDay(day) {
        const field = activeField;
        fieldEls[field].date = day;
        fieldEls[field].label.textContent = day.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        fieldEls[field].btn.classList.add('has-value');

        populateTimeSelect(field);

        // If the return date is now before the (possibly later) pickup date, clear it.
        if (field === 'pickup' && fieldEls.return.date && dateOnly(fieldEls.return.date) < dateOnly(day)) {
            fieldEls.return.date = null;
            fieldEls.return.label.textContent = 'Choisir une date';
            fieldEls.return.btn.classList.remove('has-value');
            fieldEls.return.hidden.value = '';
            populateTimeSelect('return');
        }

        syncHiddenValue(field);
        renderCalendarGrid();
    }

    function syncHiddenValue(field) {
        const f = fieldEls[field];
        if (f.date && f.time.value) {
            const y  = f.date.getFullYear();
            const m  = String(f.date.getMonth() + 1).padStart(2, '0');
            const d  = String(f.date.getDate()).padStart(2, '0');
            f.hidden.value = `${y}-${m}-${d}T${f.time.value}`;
        } else {
            f.hidden.value = '';
        }
        renderSummary();
    }

    fieldEls.pickup.time.addEventListener('change', () => syncHiddenValue('pickup'));
    fieldEls.return.time.addEventListener('change', () => syncHiddenValue('return'));

    function openCalendar(field) {
        activeField = field;
        const f = fieldEls[field];
        const base = f.date || (field === 'return' && fieldEls.pickup.date) || TODAY;
        calYear  = base.getFullYear();
        calMonth = base.getMonth();
        calModalTitle.textContent = `Choisir ${f.title}`;
        renderCalendarGrid();
        calOverlay.classList.add('show');
    }

    function closeCalendar() {
        calOverlay.classList.remove('show');
        activeField = null;
    }

    fieldEls.pickup.btn.addEventListener('click', () => openCalendar('pickup'));
    fieldEls.return.btn.addEventListener('click', () => openCalendar('return'));

    calPrevBtn.addEventListener('click', () => {
        calMonth--;
        if (calMonth < 0) { calMonth = 11; calYear--; }
        renderCalendarGrid();
    });
    calNextBtn.addEventListener('click', () => {
        calMonth++;
        if (calMonth > 11) { calMonth = 0; calYear++; }
        renderCalendarGrid();
    });

    document.getElementById('resCalToday').addEventListener('click', () => {
        calYear  = TODAY.getFullYear();
        calMonth = TODAY.getMonth();
        renderCalendarGrid();
    });
    document.getElementById('resCalClose').addEventListener('click', closeCalendar);
    document.getElementById('resCalCloseX').addEventListener('click', closeCalendar);
    calOverlay.addEventListener('click', (e) => {
        if (e.target === calOverlay) closeCalendar(); // click on backdrop
    });

    /* ── Validation + Save reservation + WhatsApp submit ── */
    const submitBtn = document.getElementById('resSubmitBtn');
    const errorEl   = document.getElementById('resError');

    const requiredIds = [
        'resPickupLoc', 'resReturnLoc', 'resPickupDate', 'resReturnDate',
        'resCivilite', 'resNom', 'resPrenom', 'resEmail', 'resTel', 'resPays'
    ];

    // The date/time value lives in hidden inputs; invalid styling and
    // scroll-into-view need to target the visible controls instead.
    const invalidTargets = {
        resPickupDate: () => [fieldEls.pickup.btn, fieldEls.pickup.time],
        resReturnDate: () => [fieldEls.return.btn, fieldEls.return.time]
    };

    function markInvalid(id) {
        (invalidTargets[id] ? invalidTargets[id]() : [document.getElementById(id)])
            .forEach(el => el.classList.add('res-invalid'));
    }

    function scrollTargetFor(id) {
        return invalidTargets[id] ? invalidTargets[id]()[0] : document.getElementById(id);
    }

    function clearInvalidStyles() {
        requiredIds.forEach(id => {
            (invalidTargets[id] ? invalidTargets[id]() : [document.getElementById(id)])
                .forEach(el => el.classList.remove('res-invalid'));
        });
    }

    function showError(msg) {
        errorEl.textContent = msg;
        errorEl.classList.add('show');
    }

    function hideError() {
        errorEl.textContent = '';
        errorEl.classList.remove('show');
    }

    submitBtn.addEventListener('click', async () => {
        hideError();
        clearInvalidStyles();

        let firstInvalid = null;

        // Check required text/select fields
        for (const id of requiredIds) {
            const el = document.getElementById(id);
            if (!el.value || !el.value.trim()) {
                markInvalid(id);
                if (!firstInvalid) firstInvalid = scrollTargetFor(id);
            }
        }

        const email = document.getElementById('resEmail');
        if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            email.classList.add('res-invalid');
            if (!firstInvalid) firstInvalid = email;
        }

        const days = getDays();
        if (days === 0 && document.getElementById('resPickupDate').value &&
            document.getElementById('resReturnDate').value) {
            showError('La date de retour doit être après la date de départ.');
            markInvalid('resReturnDate');
            scrollTargetFor('resReturnDate').scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const accept = document.getElementById('resAccept');
        if (!accept.checked) {
            if (!firstInvalid) firstInvalid = accept;
        }

        if (firstInvalid) {
            showError('Merci de remplir tous les champs obligatoires (*) et d\'accepter les conditions.');
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (typeof firstInvalid.focus === 'function') firstInvalid.focus();
            return;
        }

        if (isChosenRangeBlocked()) {
            showError('Ces dates sont déjà réservées pour cette voiture. Merci de choisir d\'autres dates.');
            scrollTargetFor('resPickupDate').scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        /* ── Build the reservation payload ── */
        const civilite   = document.getElementById('resCivilite').value;
        const nom        = document.getElementById('resNom').value.trim();
        const prenom     = document.getElementById('resPrenom').value.trim();
        const emailVal   = email.value.trim();
        const tel        = document.getElementById('resTel').value.trim();
        const pays       = document.getElementById('resPays').value.trim();
        const ville      = document.getElementById('resVille').value.trim();
        const adresse    = document.getElementById('resAdresse').value.trim();
        const vol        = document.getElementById('resVol').value.trim();
        const commentaire = document.getElementById('resComment').value.trim();

        const pickupLoc  = document.getElementById('resPickupLoc').value;
        const returnLoc  = document.getElementById('resReturnLoc').value;
        const pickupDate = document.getElementById('resPickupDate').value;
        const returnDate = document.getElementById('resReturnDate').value;

        const total = days * car.price;

        const payload = {
            carId: car.id, carName: car.name, carPrice: car.price,
            pickupLocation: pickupLoc, returnLocation: returnLoc,
            pickupDate, returnDate,
            civilite, nom, prenom, email: emailVal, telephone: tel,
            pays, ville, adresse, vol, commentaire
        };

        submitBtn.disabled = true;
        submitBtn.style.opacity = '.6';

        let savedOk = true;
        try {
            const res = await fetch(`${API_BASE}/reservations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.status === 409) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '';
                showError('Désolé, ces dates viennent d\'être réservées par quelqu\'un d\'autre. Merci de choisir d\'autres dates.');
                loadAvailability();
                return; // don't send to WhatsApp — dates are really unavailable
            }

            if (!res.ok) savedOk = false;
        } catch (e) {
            savedOk = false; // backend unreachable — still let the client reach you on WhatsApp
        }

        submitBtn.disabled = false;
        submitBtn.style.opacity = '';

        if (!savedOk) {
            console.warn('Reservation could not be saved to the dashboard, continuing to WhatsApp anyway.');
        }

        /* ── Build the WhatsApp message ── */
        const lines = [
            'Nouvelle demande de réservation',
            '',
            `Véhicule : ${car.name}`,
            `Prix : ${car.price} €/jour`,
            `Lieu de prise en charge : ${pickupLoc}`,
            `Lieu de retour : ${returnLoc}`,
            `Date de départ : ${formatDateHuman(pickupDate)}`,
            `Date de retour : ${formatDateHuman(returnDate)}`,
            `Durée : ${days} jour(s)`,
            `Total estimé : ${total} €`,
            '',
            `Client : ${civilite} ${nom} ${prenom}`,
            `Email : ${emailVal}`,
            `Téléphone : ${tel}`,
            `Pays : ${pays}`
        ];

        if (ville) lines.push(`Ville : ${ville}`);
        if (adresse) lines.push(`Adresse : ${adresse}`);
        if (vol) lines.push(`N° de vol : ${vol}`);
        if (commentaire) lines.push(`Commentaire : ${commentaire}`);

        const message = lines.join('\n');
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

        window.open(url, '_blank');
    });

});
