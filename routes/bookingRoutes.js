//bookingRoutes.js

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const sendWhatsAppMessage = require('../services/whatsappService');

router.post('/bookings', async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();

    // WhatsApp message
    await sendWhatsAppMessage(booking);

    res.status(200).json({ message: 'Booking successful', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Booking failed' });
  }
});

module.exports = router;
