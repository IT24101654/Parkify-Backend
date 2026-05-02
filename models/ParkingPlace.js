const mongoose = require('mongoose');

const parkingPlaceSchema = new mongoose.Schema({
    parkingName: { type: String, required: true },
    description: { type: String },
    slots: { type: Number, required: true },
    address: { type: String },
    city: { type: String },
    area: { type: String },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    dailyPrice: { type: Number },
    weekendPrice: { type: Number },
    type: { type: String, default: 'Private' },
    openHours: { type: String, default: '08:00' },
    closeHours: { type: String, default: '20:00' },
    is24Hours: { type: Boolean, default: false },
    weekendAvailable: { type: Boolean, default: true },
    temporaryClosed: { type: Boolean, default: false },
    status: { type: String, default: 'ACTIVE' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    placeImage: { type: String },
    hasInventory: { type: Boolean, default: false },
    hasServiceCenter: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ParkingPlace', parkingPlaceSchema);
