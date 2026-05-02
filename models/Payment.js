const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['STRIPE', 'CASH'], required: true },
    status: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'REFUND_REQUESTED'], default: 'PENDING' },
    refundReason: { type: String },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
