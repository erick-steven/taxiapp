const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    car: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Car',
        required: true 
    },
    pickupDate: { 
        type: Date, 
        required: true 
    },
    returnDate: { 
        type: Date, 
        required: true 
    },
    pickupLocation: { 
        type: String, 
        required: true 
    },
    dropoffLocation: { 
        type: String, 
        default: '' 
    },
    rentalType: { 
        type: String, 
        enum: ['daily', 'hourly', 'airport'],
        required: true 
    },
    notes: { 
        type: String,
        default: ''
    },
    estimatedTotal: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending' 
    },
    paymentStatus: { 
        type: String, 
        enum: ['unpaid', 'partial', 'paid'],
        default: 'unpaid' 
    }
}, {
    timestamps: true // Automatically manages createdAt and updatedAt fields
});

// Indexes for faster query performance
bookingSchema.index({ user: 1 });
bookingSchema.index({ car: 1 });
bookingSchema.index({ pickupDate: 1 });
bookingSchema.index({ returnDate: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
