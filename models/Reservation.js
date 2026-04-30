// models/Reservation.js
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    parkingLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingLocation',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative']
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    cancelledAt: {
        type: Date
    },
    cancellationReason: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// Indexes for common query patterns
reservationSchema.index({ driver: 1 });
reservationSchema.index({ parkingLocation: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ startTime: 1 });
reservationSchema.index({ endTime: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
