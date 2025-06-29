// Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  rentalType: String,
  carId: String,
  pickupLocation: String,
  customPickupAddress: String,
  dropoffLocation: String,
  customDropoffAddress: String,
  pickupDate: String,
  pickupTime: String,
  returnDate: String,
  returnTime: String,
  driverLanguage: String,
  driverExperience: String,
  specialRequests: String,
  licenseNumber: String,
  licenseCountry: String,
  fullName: String,
  phoneNumber: String,
  email: String,
  country: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
