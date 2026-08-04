const express = require('express');
const Reservation = require('../models/Reservation');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

const REQUIRED_FIELDS = [
    'carId', 'carName', 'pickupLocation', 'returnLocation',
    'pickupDate', 'returnDate', 'nom', 'prenom', 'email', 'telephone'
];

/* Wraps an async route handler so any rejected promise (DB error, validation
   error, etc.) is caught and turned into a normal error response instead of
   crashing the whole Node process — which used to take the entire API down
   for every user until Docker restarted the container. */
function asyncHandler(fn) {
    return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(err => {
        console.error(`${req.method} ${req.originalUrl} failed:`, err);
        if (!res.headersSent) res.status(500).json({ error: 'Server error.' });
    });
}

/* Two date ranges overlap if one starts before the other ends, both ways. */
async function findOverlap(carId, start, end, excludeId) {
    const query = {
        carId: String(carId),
        status: 'confirmed',
        pickupDate: { $lt: end },
        returnDate: { $gt: start }
    };
    if (excludeId) query._id = { $ne: excludeId };
    return Reservation.findOne(query);
}

/* ── PUBLIC: create a reservation (status starts as "pending") ── */
router.post('/', asyncHandler(async (req, res) => {
    const body = req.body || {};

    for (const field of REQUIRED_FIELDS) {
        if (!body[field] || !String(body[field]).trim()) {
            return res.status(400).json({ error: `Missing field: ${field}` });
        }
    }

    const pickupDate = new Date(body.pickupDate);
    const returnDate = new Date(body.returnDate);

    if (isNaN(pickupDate) || isNaN(returnDate) || returnDate <= pickupDate) {
        return res.status(400).json({ error: 'Invalid date range.' });
    }

    const overlap = await findOverlap(body.carId, pickupDate, returnDate);
    if (overlap) {
        return res.status(409).json({
            error: 'These dates are no longer available for this car.',
            conflict: { pickupDate: overlap.pickupDate, returnDate: overlap.returnDate }
        });
    }

    const reservation = await Reservation.create({
        carId: String(body.carId),
        carName: body.carName,
        carPrice: Number(body.carPrice) || 0,
        pickupLocation: body.pickupLocation,
        returnLocation: body.returnLocation,
        pickupDate,
        returnDate,
        civilite: body.civilite || '',
        nom: body.nom,
        prenom: body.prenom,
        email: body.email,
        telephone: body.telephone,
        pays: body.pays || '',
        ville: body.ville || '',
        adresse: body.adresse || '',
        vol: body.vol || '',
        commentaire: body.commentaire || '',
        status: 'pending'
    });

    res.status(201).json(reservation);
}));

/* ── PUBLIC: confirmed date ranges for one car (used to grey out the calendar) ── */
router.get('/availability/:carId', asyncHandler(async (req, res) => {
    const ranges = await Reservation.find({
        carId: String(req.params.carId),
        status: 'confirmed'
    }).select('pickupDate returnDate -_id');

    res.json(ranges);
}));

/* ── ADMIN: block dates for a car directly (e.g. an offline / in-person booking).
   Creates a reservation that is already "confirmed", so it immediately greys
   out those dates on the car's calendar exactly like an online booking does. ── */
router.post('/manual', requireAdmin, asyncHandler(async (req, res) => {
    const body = req.body || {};

    if (!body.carId || !body.carName || !body.pickupDate || !body.returnDate) {
        return res.status(400).json({ error: 'Missing field: carId, carName, pickupDate or returnDate.' });
    }

    const pickupDate = new Date(body.pickupDate);
    const returnDate = new Date(body.returnDate);

    if (isNaN(pickupDate) || isNaN(returnDate) || returnDate <= pickupDate) {
        return res.status(400).json({ error: 'Invalid date range.' });
    }

    const overlap = await findOverlap(body.carId, pickupDate, returnDate);
    if (overlap) {
        return res.status(409).json({
            error: 'These dates already overlap another confirmed reservation for this car.',
            conflict: { pickupDate: overlap.pickupDate, returnDate: overlap.returnDate }
        });
    }

    const reservation = await Reservation.create({
        carId: String(body.carId),
        carName: body.carName,
        carPrice: Number(body.carPrice) || 0,
        pickupLocation: body.pickupLocation || '—',
        returnLocation: body.returnLocation || '—',
        pickupDate,
        returnDate,
        civilite: '',
        nom: body.nom || 'Réservation hors-ligne',
        prenom: body.prenom || '—',
        email: body.email || 'offline@tetouandrive.local',
        telephone: body.telephone || '—',
        pays: '', ville: '', adresse: '', vol: '',
        commentaire: body.commentaire || 'Dates bloquées manuellement par l\'admin (réservation hors-ligne).',
        status: 'confirmed',
        source: 'manual'
    });

    res.status(201).json(reservation);
}));

/* ── ADMIN: list all reservations ── */
router.get('/', requireAdmin, asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const reservations = await Reservation.find(filter).sort({ createdAt: -1 });
    res.json(reservations);
}));

/* ── ADMIN: confirm / decline / reset a reservation ── */
router.patch('/:id/status', requireAdmin, asyncHandler(async (req, res) => {
    const { status } = req.body || {};
    if (!['pending', 'confirmed', 'declined'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status.' });
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reservation not found.' });

    if (status === 'confirmed') {
        const overlap = await findOverlap(reservation.carId, reservation.pickupDate, reservation.returnDate, reservation._id);
        if (overlap) {
            return res.status(409).json({ error: 'Another confirmed reservation already covers these dates for this car.' });
        }
    }

    reservation.status = status;
    await reservation.save();
    res.json(reservation);
}));

/* ── ADMIN: delete a reservation (frees the dates if it was confirmed) ── */
router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reservation not found.' });
    res.json({ deleted: true });
}));

module.exports = router;
