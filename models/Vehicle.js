const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    vehicleNumber: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    type: { type: String, required: true }, // e.g., Car, Bike, Van
    fuelType: { type: String, required: true },
    vehicleImage: { type: String }, // Path to image
    licenseImage: { type: String }, // Path to image
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
