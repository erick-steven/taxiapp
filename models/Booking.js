// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    pickupLocation: { type: String, required: true },
    customPickup: { type: String, required: false },
    destinationLocation: { type: String, required: true }, // Ensured comma here
    date: { type: Date, required: true },
    time: { type: String, required: true }
});

module.exports = mongoose.model('Booking', bookingSchema);