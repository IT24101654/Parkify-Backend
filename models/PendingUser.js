const mongoose = require('mongoose');

// This holds the user details temporarily before OTP verification
const pendingUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    address: { type: String },
    role: { type: String, enum: ['SUPER_ADMIN', 'PARKING_OWNER', 'DRIVER'], required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-delete after 10 mins
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);
