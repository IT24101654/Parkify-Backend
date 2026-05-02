const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    driverName: { type: String, required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parkingPlaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingPlace', required: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' },
    slotNumber: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    vehicleType: { type: String, required: true, default: 'Car' },
    reservationDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    duration: { type: Number },
    pricePerHour: { type: Number },
    totalAmount: { type: Number },
    status: { 
        type: String, 
        enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'EXPIRED'], 
        default: 'PENDING' 
    },
    paymentStatus: { 
        type: String, 
        enum: ['PENDING', 'PAID', 'CASH_PENDING'], 
        default: 'PENDING' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
