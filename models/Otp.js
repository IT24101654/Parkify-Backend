const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    role: { type: String }, // Used to distinguish login role selection OTP requests
    type: { type: String, enum: ['REGISTER', 'LOGIN', 'RESET_PASSWORD'], required: true },
    createdAt: { type: Date, default: Date.now, expires: 900 } // Auto-delete after 15 mins
});

module.exports = mongoose.model('Otp', otpSchema);
