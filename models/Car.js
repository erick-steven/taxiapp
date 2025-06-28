const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: String,
  brand: String,
  model: Number,
  type: String,
  rentalPrice: Number,
  fuelType: String,
  seats: Number,
  transmission: String,
  description: String,
  image: String
});

module.exports = mongoose.model('Car', carSchema);
