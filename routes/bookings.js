const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const { ensureAuthenticated } = require('../middleware/auth');

// Create new booking
router.post('/', ensureAuthenticated, async (req, res) => {
    try {
        const { 
            carId, 
            pickupDate, 
            returnDate, 
            pickupLocation, 
            rentalType, 
            notes, 
            estimatedTotal 
        } = req.body;
        
        // Check if car exists and is available
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }
        
        // Check for overlapping bookings
        const overlappingBooking = await Booking.findOne({
            car: carId,
            status: { $in: ['pending', 'confirmed'] },
            $or: [
                { 
                    pickupDate: { $lte: new Date(returnDate) },
                    returnDate: { $gte: new Date(pickupDate) }
                },
                { 
                    pickupDate: { $gte: new Date(pickupDate), $lte: new Date(returnDate) }
                }
            ]
        });
        
        if (overlappingBooking) {
            return res.status(400).json({ message: 'Car is not available for the selected dates' });
        }
        
        // Create new booking
        const newBooking = new Booking({
            user: req.user.id,
            car: carId,
            pickupDate,
            returnDate,
            pickupLocation,
            rentalType,
            notes,
            estimatedTotal
        });
        
        await newBooking.save();
        
        res.status(201).json(newBooking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get user's bookings
router.get('/my-bookings', ensureAuthenticated, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('car', 'name images pricePerDay')
            .sort({ pickupDate: 1 });
            
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get booking by ID
router.get('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('car')
            .populate('user', 'name email phone');
            
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        // Check if the requesting user owns the booking or is admin
        if (booking.user._id.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        res.json(booking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Cancel booking
router.put('/:id/cancel', ensureAuthenticated, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        // Check if the requesting user owns the booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        // Check if booking can be cancelled
        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
        }
        
        booking.status = 'cancelled';
        await booking.save();
        
        res.json(booking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;