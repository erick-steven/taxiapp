const express = require('express');
const nodemailer = require('nodemailer');
const Booking = require('../models/Booking'); // Adjust path as needed

const router = express.Router();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'enricnakon@gmail.com', // Replace with your email
        pass: 'frrl tfdu jfee edon' // Replace with your actual password or app password
    },
    tls: {
        rejectUnauthorized: false, // This line allows self-signed certificates
    },
});
router.post('/book', async(req, res) => {
    const bookingData = new Booking({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        pickupLocation: req.body.pickupLocation,
        customPickup: req.body.customPickup, // Make sure to have a corresponding field in the form if needed
        destinationLocation: req.body.destinationLocation, // Matches form input and schema
        date: req.body.date,
        time: req.body.time,
    });

    // Save booking to the database
    try {
        await bookingData.save();

        // Prepare confirmation email
        const mailOptions = {
            from: 'enricnakon@gmail.com',
            to: req.body.email,
            subject: 'Taxi Booking Confirmation',
            text: `Thank you for booking! Here are your details:\n\n
            Name: ${req.body.name}\n
            Email: ${req.body.email}\n
            Phone: ${req.body.phone}\n
            Pickup Location: ${req.body.pickupLocation} (Region: ${req.body.region})\n
            Custom Pickup: ${req.body.customPickup || 'N/A'}\n
            Destination Location: ${req.body.destinationLocation}\n
            Date: ${req.body.date}\n
            Time: ${req.body.time}\n`
        };

        // Send the confirmation email
        await transporter.sendMail(mailOptions);
        res.status(200).send('Booking successful and email sent!');
    } catch (error) {
        console.error('Error saving booking or sending email:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).send(`Validation Error: ${error.message}`);
        }
        res.status(500).send('Error saving booking or sending email.');
    }
});

module.exports = router;