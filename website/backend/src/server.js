require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const reservationRoutes = require('./routes/reservations');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/tetouandrive';

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);

// Basic error handler so a thrown/rejected error never crashes the process silently
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
});

async function start() {
    if (!process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
        console.error('Missing ADMIN_PASSWORD or JWT_SECRET in environment (.env). Refusing to start.');
        process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => console.log(`TetouanDrive API listening on port ${PORT}`));
}

start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
