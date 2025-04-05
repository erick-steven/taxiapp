// adminAuthRoutes.js

const bcrypt = require('bcryptjs');
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const User = require('../models/User'); // Ensure the User model path is correct
const router = express.Router();
const Booking = require('../models/Booking');
// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set your upload directory here
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Append timestamp to avoid name collisions
    }
});

const upload = multer({ storage });

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'enricnakon@gmail.com',
        pass: 'frrl tfdu jfee edon'
    },
    tls: {
        rejectUnauthorized: false // Allow self-signed certificates
    }
});

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next(); // User is authenticated, proceed to the next middleware or route handler
    }
    res.redirect('/admin/login'); // Redirect to login if not authenticated
};


 


 
// Registration endpoint with image upload
router.post('/register', upload.single('image'), async(req, res) => {
    const { email, password, name } = req.body; // Include name in the destructuring
    const imageUrl = req.file ? req.file.path : null; // Get the file path

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email already in use.'); // Handle existing user
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.random().toString(36).substr(2); // Simple token generation

        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            imageUrl // Store the image URL
        });

        await user.save(); // Save the new user to the database

        const verificationLink = `http://localhost:${process.env.PORT}/admin/verify/${verificationToken}`;
        await transporter.sendMail({
            to: email,
            subject: 'Email Verification',
            text: `Click this link to verify your email: ${verificationLink}`
        });

        res.send('Registration successful! Check your email for the verification link.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error. Please try again later.');
    }
});

 
// Login endpoint
router.post('/login', async(req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Login failed. Check your credentials or verify your email.');
        }

        if (!user.verified) {
            return res.status(403).send('Please verify your email before logging in.');
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            req.session.userId = user._id; // Set session variable
            return res.redirect('/admin/dashboard.html'); // Redirect to admin dashboard
        } else {
            res.status(400).send('Login failed. Check your credentials or verify your email.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error. Please try again later.');
    }
});

// Verification route
router.get('/verify/:token', async(req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        if (user) {
            user.verified = true;
            user.verificationToken = null; // Remove token after verification
            await user.save();
            res.send('Email verified successfully! You can now log in.');
        } else {
            res.send('Invalid verification link.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error. Please try again later.');
    }
});
// Register route
router.get('/register', (req, res) => {
    res.render('admin/register.html'); // Render the registration page
});
router.get('/login', (req, res) => {
    res.render('admin/login.html'); // Render the registration page
});
 

router.get('/dashboard', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/login');
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Fix image path (replace backslashes with forward slashes)
        if (user.imageUrl) {
            user.imageUrl = user.imageUrl.replace(/\\/g, '/');
        }

        const bookings = await Booking.find();
        res.render('admin/dashboard.html', { user, bookings });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


module.exports = router;