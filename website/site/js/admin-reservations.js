/* admin-reservations.js — Reservations tab in the admin dashboard.
   Talks to the Node/MongoDB backend (see docker-compose.yml). Requires
   a valid admin token in sessionStorage('td_admin_token'), set at login. */

(function () {

    const API_BASE = window.TD_API_BASE || 'http://localhost:5000/api';
    let currentFilter = '';
    let allReservations = [];

    function authHeaders() {
        const token = sessionStorage.getItem('td_admin_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    function formatDate(value) {
        const d = new Date(value);
        if (isNaN(d)) return '—';
        return d.toLocaleString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    window.setReservationFilter = function (status, btn) {
        currentFilter = status;
        document.querySelectorAll('.res-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderReservations();
    };

    async function fetchReservations() {
        const url = currentFilter
            ? `${API_BASE}/reservations?status=${encodeURIComponent(currentFilter)}`
            : `${API_BASE}/reservations`;
        const res = await fetch(url, { headers: authHeaders() });
        if (res.status === 401) throw new Error('unauthorized');
        if (!res.ok) throw new Error('request failed');
        return res.json();
    }

    window.renderReservations = async function () {
        const list = document.getElementById('reservationsList');
        const errBox = document.getElementById('resConnError');
        if (!list) return;

        list.innerHTML = '<p class="res-empty">Chargement…</p>';

        try {
            allReservations = await fetchReservations();
            errBox.style.display = 'none';
        } catch (e) {
            list.innerHTML = '';
            errBox.style.display = 'block';
            if (e.message === 'unauthorized') {
                errBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Votre session avec le serveur des réservations a expiré. Veuillez vous déconnecter puis vous reconnecter.';
            }
            return;
        }

        if (!allReservations.length) {
            list.innerHTML = '<p class="res-empty"><i class="fa-solid fa-calendar-xmark" style="font-size:28px;display:block;margin-bottom:10px;color:#ddd"></i>Aucune réservation pour l\'instant.</p>';
            refreshReservationBadge();
            return;
        }

        list.innerHTML = allReservations.map(cardHtml).join('');
        refreshReservationBadge();
    };

    function cardHtml(r) {
        const statusLabel = { pending: 'En attente', confirmed: 'Confirmée', declined: 'Refusée' }[r.status] || r.status;

        let actions = '';
        if (r.status === 'pending') {
            actions = `
                <button class="btn btn-green btn-sm" onclick="setReservationStatus('${r._id}','confirmed')"><i class="fa-solid fa-check"></i> Confirmer</button>
                <button class="btn btn-red btn-sm" onclick="setReservationStatus('${r._id}','declined')"><i class="fa-solid fa-xmark"></i> Refuser</button>
                <button class="btn btn-outline btn-sm" onclick="deleteReservationRow('${r._id}')"><i class="fa-solid fa-trash"></i> Supprimer</button>`;
        } else if (r.status === 'confirmed') {
            actions = `
                <button class="btn btn-red btn-sm" onclick="setReservationStatus('${r._id}','declined')"><i class="fa-solid fa-ban"></i> Annuler la confirmation</button>
                <button class="btn btn-outline btn-sm" onclick="deleteReservationRow('${r._id}')"><i class="fa-solid fa-trash"></i> Supprimer</button>`;
        } else { // declined
            actions = `
                <button class="btn btn-green btn-sm" onclick="setReservationStatus('${r._id}','confirmed')"><i class="fa-solid fa-check"></i> Confirmer</button>
                <button class="btn btn-outline btn-sm" onclick="deleteReservationRow('${r._id}')"><i class="fa-solid fa-trash"></i> Supprimer</button>`;
        }

        return `
            <div class="reservation-card">
                <div class="res-card-top">
                    <div>
                        <div class="res-card-car"><i class="fa-solid fa-car" style="color:#F4600A;margin-right:6px"></i>${escapeHtml(r.carName)}${r.source === 'manual' ? ' <span class="res-status-badge" style="background:#fef3c7;color:#b45309">Hors ligne</span>' : ''}</div>
                        <div class="res-card-created">Demandée le ${formatDate(r.createdAt)}</div>
                    </div>
                    <span class="res-status-badge res-status-${r.status}">${statusLabel}</span>
                </div>

                <div class="res-card-grid">
                    <div><b>Client</b>${escapeHtml(r.civilite || '')} ${escapeHtml(r.nom)} ${escapeHtml(r.prenom)}</div>
                    <div><b>Téléphone</b>${escapeHtml(r.telephone)}</div>
                    <div><b>Email</b>${escapeHtml(r.email)}</div>
                    <div><b>Pays</b>${escapeHtml(r.pays || '—')}</div>
                    <div><b>Prise en charge</b>${formatDate(r.pickupDate)}</div>
                    <div><b>Retour</b>${formatDate(r.returnDate)}</div>
                    <div><b>Lieu de prise en charge</b>${escapeHtml(r.pickupLocation)}</div>
                    <div><b>Lieu de retour</b>${escapeHtml(r.returnLocation)}</div>
                    ${r.commentaire ? `<div style="grid-column:1/-1"><b>Commentaire</b>${escapeHtml(r.commentaire)}</div>` : ''}
                </div>

                <div class="res-card-actions">${actions}</div>
            </div>
        `;
    }

    function escapeHtml(str) {
        return String(str || '').replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[m]));
    }

    window.setReservationStatus = async function (id, status) {
        try {
            const res = await fetch(`${API_BASE}/reservations/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ status })
            });
            if (res.status === 409) {
                const data = await res.json();
                showToast(data.error || 'Une autre réservation confirmée couvre déjà ces dates.');
                return;
            }
            if (!res.ok) throw new Error('failed');
            showToast(status === 'confirmed' ? 'Réservation confirmée — ces dates sont maintenant bloquées.' : 'Réservation refusée.');
            renderReservations();
        } catch (e) {
            showToast('Impossible de mettre à jour la réservation. Vérifiez la connexion au backend.');
        }
    };

    window.deleteReservationRow = async function (id) {
        if (!confirm('Supprimer cette réservation ? Si elle était confirmée, ses dates redeviendront disponibles.')) return;
        try {
            const res = await fetch(`${API_BASE}/reservations/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            });
            if (!res.ok) throw new Error('failed');
            showToast('Réservation supprimée.');
            renderReservations();
        } catch (e) {
            showToast('Impossible de supprimer la réservation. Vérifiez la connexion au backend.');
        }
    };

    window.refreshReservationBadge = async function () {
        try {
            const res = await fetch(`${API_BASE}/reservations?status=pending`, { headers: authHeaders() });
            if (!res.ok) throw new Error('failed');
            const pending = await res.json();
            const badge = document.getElementById('sbReservationBadge');
            const stat  = document.getElementById('statPendingRes');
            if (badge) {
                if (pending.length) { badge.textContent = pending.length; badge.style.display = 'inline-block'; }
                else badge.style.display = 'none';
            }
            if (stat) stat.textContent = pending.length;
        } catch (e) {
            const stat = document.getElementById('statPendingRes');
            if (stat) stat.textContent = '—';
        }
    };

    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (!toast) { alert(msg); return; }
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

})();
