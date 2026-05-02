const Payment = require('../models/Payment');
const Reservation = require('../models/Reservation');

exports.getMyPayments = async (req, res) => {
    try {
        const driverId = req.user.id;
        // Find reservations by driverId first
        const reservations = await Reservation.find({ driverId });
        const resIds = reservations.map(r => r._id);
        
        const payments = await Payment.find({ reservationId: { $in: resIds } })
            .populate('reservationId', 'slotNumber parkingPlaceId vehicleNumber reservationDate totalAmount')
            .sort({ createdAt: -1 });

        // Populate parking name
        const ParkingPlace = require('../models/ParkingPlace');
        const formatted = await Promise.all(payments.map(async p => {
            const place = await ParkingPlace.findById(p.reservationId.parkingPlaceId).select('parkingName');
            return {
                id: p._id,
                amount: p.amount,
                status: p.status,
                paymentMethod: p.paymentMethod,
                createdAt: p.createdAt,
                reservationId: p.reservationId._id,
                slotNumber: p.reservationId.slotNumber,
                parkingName: place ? place.parkingName : 'Unknown',
                refundReason: p.refundReason
            };
        }));

        res.status(200).json(formatted);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.requestRefund = async (req, res) => {
    try {
        const { paymentId, reason } = req.body;
        const payment = await Payment.findById(paymentId);
        
        if (!payment) return res.status(404).json({ error: "Payment not found" });
        
        // Ensure only the driver who made the payment can request refund
        const reservation = await Reservation.findById(payment.reservationId);
        if (reservation.driverId.toString() !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        if (payment.status !== 'PAID') {
            return res.status(400).json({ error: "Only paid reservations can be refunded" });
        }

        payment.status = 'REFUND_REQUESTED';
        payment.refundReason = reason;
        await payment.save();

        res.status(200).json({ message: "Refund requested successfully", payment });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getPendingRefundsForOwner = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const refunds = await Payment.find({ ownerId, status: 'REFUND_REQUESTED' })
            .populate({
                path: 'reservationId',
                populate: { path: 'parkingPlaceId', select: 'parkingName' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json(refunds);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.processRefund = async (req, res) => {
    try {
        const { paymentId, action } = req.body; // action: 'APPROVE' or 'REJECT'
        const payment = await Payment.findById(paymentId);
        
        if (!payment) return res.status(404).json({ error: "Payment not found" });
        if (payment.ownerId.toString() !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        if (action === 'APPROVE') {
            payment.status = 'REFUNDED';
            // Update reservation status too
            await Reservation.findByIdAndUpdate(payment.reservationId, { paymentStatus: 'REFUNDED', status: 'CANCELLED' });
        } else {
            payment.status = 'PAID';
            payment.refundReason = null;
        }

        await payment.save();
        res.status(200).json({ message: `Refund ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getOwnerEarnings = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const ownerIdStr = req.user.id || req.user._id;
        const ownerId = new mongoose.Types.ObjectId(ownerIdStr);
        
        console.log('--- Earnings Debug ---');
        console.log('Current Owner ID:', ownerIdStr);
        
        // Find all parking places belonging to this owner
        const ParkingPlace = require('../models/ParkingPlace');
        const ownerPlaces = await ParkingPlace.find({ ownerId });
        console.log('Places owned by this user:', ownerPlaces.length);
        const placeIds = ownerPlaces.map(p => p._id);
 
        // Find reservations for these places
        const ownerReservations = await Reservation.find({ parkingPlaceId: { $in: placeIds } });
        console.log('Reservations found for these places:', ownerReservations.length);
        const resIds = ownerReservations.map(r => r._id);
 
        // Find payments that are PAID and either have the ownerId OR are linked to these reservations
        const payments = await Payment.find({
            $and: [
                { status: 'PAID' },
                {
                    $or: [
                        { ownerId: ownerId },
                        { reservationId: { $in: resIds } }
                    ]
                }
            ]
        })
        .populate({
            path: 'reservationId',
            select: 'slotNumber vehicleNumber driverName driverId',
            populate: {
                path: 'driverId',
                select: 'name email phoneNumber'
            }
        })
        .sort({ createdAt: -1 });

        console.log('Total Payments found:', payments.length);
        
        const totalEarnings = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        console.log('Total Earnings:', totalEarnings);

        res.status(200).json({ 
            totalEarnings, 
            count: payments.length, 
            payments: payments.map(p => ({
                id: p._id,
                ...p._doc,
                parkingName: ownerPlaces.find(pl => {
                    const res = ownerReservations.find(r => r._id.toString() === p.reservationId?._id?.toString());
                    return res && pl._id.toString() === res.parkingPlaceId?.toString();
                })?.parkingName || 'N/A'
            }))
        });
    } catch (error) {
        console.error('Earnings API Error:', error);
        res.status(400).json({ error: error.message });
    }
};
