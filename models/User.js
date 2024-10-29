const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true }, // Added name field
    verified: { type: Boolean, default: false },
    verificationToken: { type: String },
    imageUrl: { type: String } // Store the image URL
});

// Check if the model already exists before creating it
const User = mongoose.models.User1 || mongoose.model('User1', userSchema);

module.exports = User;
