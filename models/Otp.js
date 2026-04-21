const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    role: { type: String }, // Used to distinguish login role selection OTP requests
    type: { type: String, enum: ['REGISTER', 'LOGIN'], required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // Auto-delete after 5 mins
});

module.exports = mongoose.model('Otp', otpSchema);
