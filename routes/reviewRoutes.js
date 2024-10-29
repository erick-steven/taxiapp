// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// POST a new review
router.post('/', async (req, res) => {
    const { name, email, review } = req.body;
    const newReview = new Review({ name, email, review });
    await newReview.save();
    res.status(201).json(newReview);
});

// GET the latest four reviews
router.get('/latest', async (req, res) => {
    const latestReviews = await Review.find().sort({ createdAt: -1 }).limit(4);
    res.json(latestReviews);
});

// GET all reviews
router.get('/', async (req, res) => {
    const reviews = await Review.find();
    res.json(reviews);
});

module.exports = router;
