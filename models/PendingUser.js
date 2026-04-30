const mongoose = require('mongoose');

// This holds the user details temporarily before OTP verification
const pendingUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    address: { type: String },
    role: { type: String, enum: ['SUPER_ADMIN', 'PARKING_OWNER', 'DRIVER'], required: true },
    driverPreferences: { type: String },
    ownerServices: {
        hasInventory: { type: Boolean, default: false },
        hasServiceCenter: { type: Boolean, default: false }
    },
    createdAt: { type: Date, default: Date.now, expires: 900 } // Auto-delete after 15 mins
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);
