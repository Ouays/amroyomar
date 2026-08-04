# TetouanDrive — Reservations with Admin Confirmation

## What changed

Before: the reservation form only sent a WhatsApp message. Nothing was saved,
and there was no link between "client books" and "car becomes unavailable."

Now:
1. Client fills the reservation form on a car page → it's saved to a
   **MongoDB database** (via a small API) with status **pending**, and the
   WhatsApp message still opens exactly like before.
2. You open **admin.html → Reservations** and see every request.
3. **Confirm** it → those dates are now blocked for that car. Anyone else
   trying to book overlapping dates for the same car gets rejected
   automatically (checked on the server, not just in the browser).
4. **Decline** it, or **Delete** a confirmed one → the dates become bookable
   again immediately.

This required adding a real backend, because your site was previously
"static" (no server) — a reservation made by a client on their phone has to
reach *you* on a different device, and browsers can't do that on their own.

## Folder structure

```
site/       → your website (unchanged, plus the reservation additions)
backend/    → Node.js + Express + MongoDB API (Dockerized)
docker-compose.yml
```

## Running it locally

1. **Configure the backend**
   ```bash
   cd backend
   cp .env.example .env
   ```
   Open `.env` and set:
   - `ADMIN_PASSWORD` — must match the password in `site/admin.html`
     (search for `ADMIN_PASSWORD` near the top of the `<script>` at the
     bottom of the file — it currently defaults to `admin2024` in both
     places, change both together).
   - `JWT_SECRET` — any long random string.

2. **Start MongoDB + the API**
   ```bash
   cd ..
   docker compose up -d --build
   ```
   This starts:
   - `tetouandrive-mongo` — the database (data persists in a Docker volume)
   - `tetouandrive-backend` — the API, on `http://localhost:5000`

   Check it's alive: open `http://localhost:5000/api/health` → `{"ok":true}`

3. **Serve the website** (can't just double-click the HTML files — the
   browser blocks the API calls from a `file://` page). From the `site`
   folder, run any static server, e.g.:
   ```bash
   cd site
   npx serve .
   ```
   or `python3 -m http.server 8080`, then open the printed `localhost` URL.

4. **Point the site at your backend.** Open `site/js/config.js`:
   ```js
   window.TD_API_BASE = 'http://localhost:5000/api';
   ```
   Leave this as-is for local use. When you eventually put the backend on a
   real server, change this URL to that server's address.

## Using it

- Go to any car page, fill the reservation form, submit → it opens WhatsApp
  as before, and the reservation now also appears in the admin dashboard.
- Go to `admin.html`, log in, click **Reservations** in the sidebar.
- **Confirm** a pending reservation → its dates get blocked for that car
  (visible as a small red calendar on that car's page, under the date
  fields, once someone else opens it).
- **Decline** or **Delete** it → dates free up again right away.

## Things worth knowing

- **Passwords**: `ADMIN_PASSWORD` currently lives in two places (the backend
  `.env` and inside `site/admin.html`). Keep them identical or the
  Reservations tab won't be able to log in to the API (the rest of the
  admin panel — Fleet, Reviews, Slideshow — still works locally either way,
  since those never left `localStorage`).
- **WhatsApp number**: still set at the top of `site/js/reservation.js`
  (`WHATSAPP_NUMBER`), unchanged from before.
- **If the backend is down**, the reservation form still sends the WhatsApp
  message (so you never lose a lead) — it just can't save it to the
  dashboard or check availability until the backend is back up.
- **Deploying for real**: you'll want the backend reachable over the
  internet (a small VPS running `docker compose up -d`, or any host that
  runs Docker containers), `site/js/config.js` pointed at that public URL,
  and ideally HTTPS on both. Happy to help with that step when you're ready.
