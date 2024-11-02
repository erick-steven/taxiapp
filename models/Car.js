const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    carName: { type: String, required: true },
    carPrice: { type: Number, required: true },
    carDescription: { type: String, required: true },
    carImage: { type: String, required: true } // URL/path to the image
});

module.exports = mongoose.model('Car', carSchema);