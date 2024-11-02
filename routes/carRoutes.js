// carRoutes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const Car = require('../models/Car'); // Adjust the path as necessary

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the directory to save the uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Save with a unique name
    }
});

// Only allow images to be uploaded
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Assuming you have a route that renders the index page
router.get('/', async(req, res) => {
    try {
        // Fetch cars from the database
        const cars = await Car.find(); // Ensure your Car model is defined correctly
        console.log(cars); // Debug: Check if cars are fetched properly
        // Pass the cars to the view
        res.render('index', { cars });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


router.get('/', async(req, res) => {
    try {
        const cars = await Car.find(); // Fetch cars from the database
        console.log(cars); // Log the cars to see if they are fetched
        res.render('index', { cars }); // Pass cars to the EJS template
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to render the form for adding a new car
router.get('/form', (req, res) => {
    res.render('car_form'); // Ensure car_form.ejs is in the views directory
});

// Route to handle adding a new car
router.post('/add', upload.single('carImage'), async(req, res) => {
    const { carName, carPrice, carDescription } = req.body;
    const carImage = req.file ? req.file.path : ''; // Path to the uploaded image

    const newCar = new Car({
        carName,
        carPrice,
        carDescription,
        carImage
    });

    try {
        await newCar.save();
        res.redirect('/cars'); // Redirect to the /cars page after saving
    } catch (error) {
        console.error('Error saving car:', error);
        res.status(500).send('Error saving car data.');
    }
});

// Other routes can be added here...

module.exports = router;