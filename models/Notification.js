const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'USER_REGISTRATION'
    isRead: { type: Boolean, default: false },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
