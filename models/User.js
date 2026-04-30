const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    address: { type: String },
    role: { type: String, enum: ['SUPER_ADMIN', 'PARKING_OWNER', 'DRIVER'], required: true },
    active: { type: Boolean, default: true },
    profilePicture: { type: String },
    nicNumber: { type: String },
    twoFactorEnabled: { type: Boolean, default: false },
    // Role specific fields
    driverPreferences: {
        type: String, // cheapest, available, nearest
    },
    ownerServices: {
        hasInventory: { type: Boolean, default: false },
        hasServiceCenter: { type: Boolean, default: false }
    },
    isProfileComplete: { type: Boolean, default: false }
}, { timestamps: true });

// Ensure unique combination of email and role
userSchema.index({ email: 1, role: 1 }, { unique: true });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        throw err;
    }
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
