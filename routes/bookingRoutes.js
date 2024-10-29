




    const express = require('express');
const nodemailer = require('nodemailer');
const Booking = require('../models/Booking'); // Adjust path as needed

const router = express.Router();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
 
      user: 'enricnakon@gmail.com',
      pass: 'frrl tfdu jfee edon'
    
  
    },
    tls: {
        rejectUnauthorized: false, // This line allows self-signed certificates
  
  
    },
});


 

// POST endpoint to handle form submission
router.post('/book', async (req, res) => {
    const bookingData = new Booking(req.body);

    // Save booking to the database
    try {
        await bookingData.save();

        // Prepare confirmation email
        const mailOptions = {
            from: 'your-email@gmail.com', // Replace with your email
            to: req.body.email,
            subject: 'Taxi Booking Confirmation',
            text: `Thank you for booking! Here are your details:\n\n
            Name: ${req.body.name}\n
            Email: ${req.body.email}\n
            Phone: ${req.body.phone}\n
            Pickup Location: ${req.body.pickupLocation}\n
            Custom Pickup: ${req.body.customPickup || 'N/A'}\n
            Destination: ${req.body.destination}\n
            Date: ${req.body.date}\n
            Time: ${req.body.time}`,
        };

        // Send the confirmation email
        await transporter.sendMail(mailOptions);
        res.status(200).send('Booking successful and email sent!');
    } catch (error) {
        console.error('Error saving booking or sending email:', error);
        res.status(500).send('Error saving booking or sending email.');
    }
});

module.exports = router;
