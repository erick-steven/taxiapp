const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Car = require('../models/Car'); // ✅ path must match your file structure


const Booking = require('../models/Booking');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
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
    limits: { fileSize: 5 * 1024 * 1024 }
});
// Get all cars (for HTML rendering)
router.get('/', async (req, res) => {
    try {
        const cars = await Car.find();
        res.render('cars/index', { cars });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
// In your cars route file
router.get('/api/cars', async (req, res) => {
    try {
        const cars = await Car.find().lean();
        
        // Always return an array, even if empty
        if (!cars) {
            return res.status(200).json([]);
        }
        
        // If single object was found (unlikely with find(), but just in case)
        if (!Array.isArray(cars)) {
            return res.status(200).json([cars]);
        }
        
        res.status(200).json(cars);
    } catch (err) {
        console.error('Error fetching cars:', err);
        res.status(500).json({
            error: 'Server Error',
            message: err.message,
            // Include this to help frontend handle the error
            $isError: true
        });
    }
});

// Get car upload form

// Serve the static upload form (car_upload.html)
router.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/car_upload.html')); // ✅ Fix
});
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        // Destructure and validate all required fields
        const requiredFields = [
            'name', 'brand', 'model', 'type', 
            'rentalPrice', 'fuelType', 'seats', 
            'transmission', 'description'
        ];
        
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.render('car_upload', {
                error: `Missing required fields: ${missingFields.join(', ')}`,
                formData: req.body
            });
        }

        // Validate image upload
        if (!req.file) {
            return res.render('car_upload', {
                error: 'Car image is required',
                formData: req.body
            });
        }

        // Validate number fields
        if (isNaN(req.body.rentalPrice) || isNaN(req.body.seats)) {
            return res.render('car_upload', {
                error: 'Price and seats must be valid numbers',
                formData: req.body
            });
        }

        // Create new car with proper type conversions
        const newCar = new Car({
            name: req.body.name.trim(),
            brand: req.body.brand.trim(),
            model: req.body.model.toString().trim(),
            type: req.body.type,
            rentalPrice: parseFloat(req.body.rentalPrice),
            fuelType: req.body.fuelType,
            seats: parseInt(req.body.seats),
            transmission: req.body.transmission,
            description: req.body.description.trim(),
            image: `/uploads/${req.file.filename}`,
            availability: true
        });

        // Save to database
        await newCar.save();
        
        // Redirect with success message
        req.flash('success', 'Car added successfully!');
        res.redirect('/car_upload');
        
    } catch (error) {
        console.error('Error saving car:', error);
        
        // Handle duplicate key errors differently
        if (error.code === 11000) {
            return res.render('car_upload', {
                error: 'This car already exists in the system',
                formData: req.body
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.render('car_upload', {
                error: errors.join(', '),
                formData: req.body
            });
        }
        
        // Generic error handler
        res.render('car_upload', {
            error: 'An unexpected error occurred. Please try again.',
            formData: req.body
        });
    }
});
// API to get all cars
router.get('/api', async (req, res) => {
    try {
        const cars = await Car.find();
        res.json(cars);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// API to get single car
router.get('/api/:id', async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }
        res.json(car);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// API to create booking
router.post('/api/bookings', async (req, res) => {
    try {
        const {
            user,
            car,
            pickupLocation,
            dropoffLocation,
            pickupDate,
            returnDate,
            rentalType
        } = req.body;

        // Validate required fields
        if (!user || !car || !pickupLocation || !pickupDate || !returnDate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Calculate total
        const carData = await Car.findById(car);
        if (!carData) {
            return res.status(404).json({ error: 'Car not found' });
        }

        const startDate = new Date(pickupDate);
        const endDate = new Date(returnDate);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        
        let estimatedTotal = carData.rentalRatePerDay * diffDays;
        
        // Apply discounts based on rental type
        if (rentalType === 'weekly') {
            estimatedTotal *= 0.9; // 10% discount
        } else if (rentalType === 'monthly') {
            estimatedTotal *= 0.8; // 20% discount
        }

        const newBooking = new Booking({
            user,
            car,
            pickupLocation,
            dropoffLocation,
            pickupDate,
            returnDate,
            rentalType,
            estimatedTotal,
            status: 'pending'
        });

        await newBooking.save();
        
        // Update car availability
        await Car.findByIdAndUpdate(car, { availability: false });

        res.status(201).json(newBooking);
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;