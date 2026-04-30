// models/ParkingLocation.js
const mongoose = require('mongoose');

const parkingLocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    description: {
        type: String,
        trim: true
    },
    totalSlots: {
        type: Number,
        required: true,
        min: [1, 'Total slots must be at least 1']
    },
    availableSlots: {
        type: Number,
        required: true,
        min: [0, 'Available slots cannot be negative']
    },
    pricePerHour: {
        type: Number,
        required: true,
        min: [0, 'Price per hour cannot be negative']
    },
    operatingHours: {
        open: { type: String, default: '06:00' },   // "HH:mm" 24-hour format
        close: { type: String, default: '22:00' }
    },
    amenities: [{ type: String }],  // e.g. ["CCTV", "EV Charging", "Covered", "24/7"]
    isActive: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Indexes for common query patterns
parkingLocationSchema.index({ owner: 1 });
parkingLocationSchema.index({ city: 1 });
parkingLocationSchema.index({ isActive: 1 });

module.exports = mongoose.model('ParkingLocation', parkingLocationSchema);
