const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema(
    {
        carId:      { type: String, required: true },
        carName:    { type: String, required: true },
        carPrice:   { type: Number, default: 0 },

        pickupLocation: { type: String, required: true },
        returnLocation: { type: String, required: true },
        pickupDate:     { type: Date, required: true },
        returnDate:     { type: Date, required: true },

        civilite:    String,
        nom:         { type: String, required: true },
        prenom:      { type: String, required: true },
        email:       { type: String, required: true },
        telephone:   { type: String, required: true },
        pays:        String,
        ville:       String,
        adresse:     String,
        vol:         String,
        commentaire: String,

        status: {
            type: String,
            enum: ['pending', 'confirmed', 'declined'],
            default: 'pending',
            index: true
        },

        // 'online'  = created by a client through the website's reservation form
        // 'manual'  = created by the admin to block dates for an offline booking
        source: {
            type: String,
            enum: ['online', 'manual'],
            default: 'online'
        }
    },
    { timestamps: true }
);

// Fast overlap lookups per car/status
ReservationSchema.index({ carId: 1, status: 1, pickupDate: 1, returnDate: 1 });

module.exports = mongoose.model('Reservation', ReservationSchema);
