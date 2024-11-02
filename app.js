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

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Ensure uploads folder is served

// Use routes
app.use('/admin', adminAuthRoutes);
app.use('/reviews', reviewRoutes);
app.use('/cars', carRoutes);
app.use('/api', bookingRoutes);
app.use('/gallery', imageRoutes);

// Default route to render index.ejs with car and review data
app.get('/', async(req, res) => {
    try {
        const cars = await Car.find(); // Fetch cars
        const reviews = await Review.find(); // Fetch reviews
        const images = await Image.find(); // Fetch images for the gallery
        res.render('index', { cars, reviews, images }); // Pass cars, reviews, and images to the view
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Render registration page
app.get('/register', (req, res) => {
    res.render('admin/register'); // Ensure the path is correct
});

// Car form route
app.get('/form', (req, res) => {
    res.render('car_form'); // Ensure car_form.ejs exists in your views folder
});

// Render image upload page
app.get('/upload', (req, res) => {
    res.render('upload'); // Ensure upload.ejs exists in your views folder
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