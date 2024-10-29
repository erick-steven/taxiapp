// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  pickupLocation: String,
  customPickup: String,
  destination: String,
  date: Date,
  time: String,
});

module.exports = mongoose.model('Booking', bookingSchema);
