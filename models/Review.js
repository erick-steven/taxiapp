// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    review: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }, // New date field
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
