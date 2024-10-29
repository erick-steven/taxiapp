// auth.js


const bcrypt = require('bcryptjs');
const express = require('express');

const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();


const multer = require('multer');



// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the directory for uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Add timestamp to avoid filename collisions
    }
});


const upload = multer({ storage });





// Email transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'enricnakon@gmail.com',
        pass: 'frrl tfdu jfee edon'
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Register route
router.get('/register', (req, res) => {
    res.render('admin/register'); // Render the registration page
});

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
            name, // Store the name
            verificationToken,
            imageUrl // Store the image URL
        });

        await user.save();

        const verificationLink = `http://localhost:${process.env.PORT}/verify/${verificationToken}`;
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

// Login route
router.get('/login', (req, res) => {
    res.render('admin/login'); // Render the login page
});

router.post('/login', async(req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Login failed. Check your credentials or verify your email.'); // Handle non-existing user
        }

        if (!user.verified) {
            return res.status(403).send('Please verify your email before logging in.'); // Handle unverified user
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            req.session.userId = user._id; // Set session variable
            return res.redirect('/dashboard');
        } else {
            res.status(400).send('Login failed. Check your credentials or verify your email.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error. Please try again later.');
    }
});

module.exports = router;