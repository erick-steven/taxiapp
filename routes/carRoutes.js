const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Car = require('../models/Car');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save images in the "uploads" folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});

// Serve the static upload form (car_upload.html)
router.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/car_upload.html')); // ✅ Fix
});

// Handle file upload and save car details
router.post('/add', upload.single('carImage'), async (req, res) => {
    try {
        const { carName, carPrice, carDescription } = req.body;
        if (!req.file) {
            return res.status(400).send('Please upload an image.');
        }

        const carImage = `/uploads/${req.file.filename}`; // Store image path

        const newCar = new Car({
            carName,
            carPrice,
            carDescription,
            carImage
        });

        await newCar.save();
        res.redirect('/cars'); // Redirect to car listing page
    } catch (error) {
        console.error('Error saving car:', error);
        res.status(500).send('Error saving car data.');
    }
});

// Serve the static index page (index.html)
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html')); // ✅ Fix
});

// API to get all car details in JSON (For frontend to fetch)
router.get('/api', async (req, res) => {
    try {
        const cars = await Car.find();
        res.json(cars); // Send data as JSON for frontend to render dynamically
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to display all cars
// Your route to render the index page and pass the car data
router.get('/', async (req, res) => {
    try {
        const cars = await Car.find(); // Fetch cars from database
        // Instead of rendering HTML directly, pass the data to the view
        res.render('index', { cars: JSON.stringify(cars) }); // Pass the cars as JSON
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
