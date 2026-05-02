const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    slotName: { type: String, required: true },
    slotType: { type: String, default: 'Car' },
    slotStatus: { type: String, default: 'Available' },
    floor: { type: String },
    placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingPlace', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Slot', slotSchema);
