// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Route to fetch all reviews
router.get('/', async(req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 }); // Fetch and sort reviews
        console.log('Fetched Reviews:', reviews); // Log the fetched reviews
        res.render('index', { reviews }); // Pass reviews to the EJS template
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).send('Server Error');
    }
});

// Route to add a new review
router.post('/add', async(req, res) => {
    const { name, email, review } = req.body;

    const newReview = new Review({
        name,
        email,
        review,
    });

    try {
        await newReview.save();
        res.redirect('/'); // Redirect to the homepage or reviews page
    } catch (error) {
        console.error('Error saving review:', error);
        res.status(500).send('Error saving review.');
    }
});

module.exports = router;