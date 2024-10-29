const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
const bcrypt = require('bcryptjs');

// Routes
const adminAuthRoutes = require('./routes/adminAuthRoutes');


// Create the Express app
const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Generate a secure random secret key for the session
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// Set up session management
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Only secure in production
        maxAge: 24 * 60 * 60 * 1000 // Session expiration: 1 day
    }
}));

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/adminDB', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => console.log('Database connected'))
    .catch(err => console.error('Database connection error:', err));

// Use the admin authentication routes
app.use('/admin', adminAuthRoutes);


// Route to render index.ejs
app.get('/', (req, res) => {
    res.render('index'); // Render index.ejs
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));