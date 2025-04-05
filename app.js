const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Image = require('./models/Image'); // Ensure this model exists

dotenv.config();

// Import models
const Car = require('./models/Car');
const Review = require('./models/Review');

// Import routes
const imageRoutes = require('./routes/imageRoutes');
const carRoutes = require('./routes/carRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Create the Express app
const app = express();

// Generate a secure random secret key for the session
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// Set up session management
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Serve static files from the 'public' directory
app.use(express.static('public')); // Serve static HTML, CSS, JS
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images
 

// Serve images from /uploads/images
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));


// Use routes
app.use('/admin', adminAuthRoutes);
app.use('/reviews', reviewRoutes);
app.use('/cars', carRoutes);
app.use('/api', bookingRoutes);
// Routes
app.use('/api/images', imageRoutes);




// Default route to render index.ejs with car and review data
// Fetch cars, reviews, and images data as JSON
app.get('/api/cars', async (req, res) => {
    try {
        const cars = await Car.find(); // Fetch cars
        const reviews = await Review.find(); // Fetch reviews
        const images = await Image.find(); // Fetch images
        res.json({ cars, reviews, images }); // Send data as JSON
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


// Render registration page
app.get('/register', (req, res) => {
    res.render('admin/register'); // Ensure the path is correct
});

// Render registration page
app.get('/login', (req, res) => {
    res.render('admin/login'); // Ensure the path is correct
});

// Car form route
app.get('/form', (req, res) => {
    res.render('car_form'); // Ensure car_form.ejs exists in your views folder
});

 
app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
  });
  

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => console.log('Database connected'))
    .catch(err => console.error('Database connection error:', err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));