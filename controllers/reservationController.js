const Reservation = require('../models/Reservation');
const Payment = require('../models/Payment');
const ParkingPlace = require('../models/ParkingPlace');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.bookParking = async (req, res) => {
    try {
        const driverId = req.user.id;
        const bookingData = req.body;

        const reservation = new Reservation({
            driverName: bookingData.driverName,
            driverId: driverId,
            parkingPlaceId: bookingData.parkingPlaceId,
            slotId: bookingData.slotId,
            slotNumber: bookingData.slotNumber,
            vehicleNumber: bookingData.vehicleNumber,
            vehicleType: bookingData.vehicleType,
            reservationDate: bookingData.reservationDate,
            startTime: bookingData.startTime,
            endTime: bookingData.endTime,
            duration: bookingData.duration,
            pricePerHour: bookingData.pricePerHour,
            totalAmount: bookingData.totalAmount,
            status: 'PENDING',
            paymentStatus: 'PENDING'
        });

        await reservation.save();
        res.status(200).json(reservation);
    } catch (error) {
        console.error("Error booking parking:", error);
        res.status(400).json({ error: error.message || "Server error" });
    }
};

exports.getMyReservations = async (req, res) => {
    try {
        const driverId = req.user.id;
        // Populate parkingPlaceName via parkingPlaceId
        const reservations = await Reservation.find({ driverId }).populate('parkingPlaceId', 'parkingName address location').sort({ createdAt: -1 });
        
        // Auto-verify pending Stripe payments
        for (let r of reservations) {
            if (r.paymentStatus === 'PENDING' && r.status !== 'CANCELLED') {
                const payment = await Payment.findOne({ reservationId: r._id, paymentMethod: 'STRIPE', status: 'PENDING' });
                if (payment && payment.stripeSessionId) {
                    try {
                        const session = await stripe.checkout.sessions.retrieve(payment.stripeSessionId);
                        if (session.payment_status === 'paid') {
                            r.paymentStatus = 'PAID';
                            r.status = 'CONFIRMED';
                            await r.save();
                            payment.status = 'PAID';
                            payment.stripePaymentIntentId = session.payment_intent;
                            await payment.save();
                        }
                    } catch(e) {
                        console.error('Error verifying stripe session', e);
                    }
                }
            }
        }
        // Transform the data slightly to match the expected frontend format
        const formatted = reservations.map(r => ({
            id: r._id,
            ...r._doc,
            parkingName: r.parkingPlaceId ? r.parkingPlaceId.parkingName : 'Unknown',
            parkingLocation: r.parkingPlaceId ? (r.parkingPlaceId.location || r.parkingPlaceId.address) : ''
        }));
        
        res.status(200).json(formatted);
    } catch (error) {
        res.status(400).json({ error: error.message || "Server error" });
    }
};

exports.getReservationById = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return res.status(404).json({ error: "Reservation not found" });
        res.status(200).json(reservation);
    } catch (error) {
        res.status(400).json({ error: error.message || "Server error" });
    }
};

exports.initiatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const driverId = req.user.id;
        const payload = req.body;
        const method = payload.paymentMethod || "STRIPE";

        const reservation = await Reservation.findOne({ _id: id, driverId });
        if (!reservation) return res.status(404).json({ error: "Reservation not found" });

        const parkingPlace = await ParkingPlace.findById(reservation.parkingPlaceId);
        if (!parkingPlace) return res.status(404).json({ error: "Parking place not found" });

        if (method === 'CASH') {
            reservation.paymentStatus = 'CASH_PENDING';
            await reservation.save();

            const payment = new Payment({
                reservationId: reservation._id,
                ownerId: parkingPlace.ownerId,
                amount: reservation.totalAmount,
                paymentMethod: 'CASH',
                status: 'PENDING'
            });
            await payment.save();

            return res.status(200).json({ message: "Cash payment selected." });
        } else {
            // STRIPE
            const total = reservation.totalAmount;
            if (!total || total <= 0) return res.status(400).json({ error: "Invalid reservation amount" });

            // Using LKR or default USD, since Stripe supports LKR. Amount in cents.
            const unitAmount = Math.round(total * 100);

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'lkr',
                            product_data: {
                                name: `Reservation for ${reservation.slotNumber}`,
                                description: `Parking from ${reservation.startTime} to ${reservation.endTime}`,
                            },
                            unit_amount: unitAmount,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.STRIPE_REDIRECT_URL}?success=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.STRIPE_REDIRECT_URL}?canceled=true`,
                metadata: {
                    reservationId: reservation._id.toString()
                }
            });

            const payment = new Payment({
                reservationId: reservation._id,
                ownerId: parkingPlace.ownerId,
                amount: total,
                paymentMethod: 'STRIPE',
                status: 'PENDING',
                stripeSessionId: session.id
            });
            await payment.save();

            res.status(200).json({ checkoutUrl: session.url });
        }
    } catch (error) {
        console.error("Payment initiation error:", error);
        res.status(400).json({ error: error.message || "Payment initiation failed" });
    }
};

exports.cancelReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const driverId = req.user.id;
        
        const reservation = await Reservation.findOneAndUpdate(
            { _id: id, driverId },
            { status: 'CANCELLED' },
            { new: true }
        );
        res.status(200).json(reservation);
    } catch (error) {
        res.status(400).json({ error: error.message || "Server error" });
    }
};

exports.updateReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const driverId = req.user.id;
        const data = req.body;
        
        const reservation = await Reservation.findOneAndUpdate(
            { _id: id, driverId },
            { $set: data },
            { new: true }
        );
        res.status(200).json(reservation);
    } catch (error) {
        res.status(400).json({ error: error.message || "Server error" });
    }
};

exports.getReservationsForOwner = async (req, res) => {
    try {
        // Need to find all parking places owned by this user
        const ownerId = req.user.id || req.params.ownerId; // Fallback if admin
        const ParkingPlace = require('../models/ParkingPlace');
        const places = await ParkingPlace.find({ ownerId });
        const placeIds = places.map(p => p._id);

        const reservations = await Reservation.find({ parkingPlaceId: { $in: placeIds } }).populate('parkingPlaceId', 'parkingName address location').sort({ createdAt: -1 });
        
        const formatted = reservations.map(r => ({
            id: r._id,
            ...r._doc,
            parkingName: r.parkingPlaceId ? r.parkingPlaceId.parkingName : 'Unknown',
            parkingLocation: r.parkingPlaceId ? (r.parkingPlaceId.location || r.parkingPlaceId.address) : ''
        }));
        
        res.status(200).json(formatted);
    } catch (error) {
        res.status(400).json({ error: error.message || "Server error" });
    }
};

exports.confirmReservation = async (req, res) => {
    try {
        const { id } = req.params;
        
        const reservation = await Reservation.findByIdAndUpdate(
            id,
            { status: 'CONFIRMED' },
            { new: true }
        );
        res.status(200).json(reservation);
    } catch (error) {
        res.status(400).json({ error: error.message || "Server error" });
    }
};

exports.cancelReservationByOwner = async (req, res) => {
    try {
        const { id } = req.params;
        
        const reservation = await Reservation.findByIdAndUpdate(
            id,
            { status: 'CANCELLED' },
            { new: true }
        );
        res.status(200).json(reservation);
    } catch (error) {
        res.status(400).json({ error: error.message || "Server error" });
    }
};
exports.markReservationAsPaid = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const reservation = await Reservation.findById(reservationId);
        
        if (!reservation) return res.status(404).json({ error: "Reservation not found" });

        // Update reservation status
        reservation.paymentStatus = 'PAID';
        reservation.status = 'CONFIRMED';
        await reservation.save();

        // Update Payment status
        const Payment = require('../models/Payment');
        await Payment.findOneAndUpdate(
            { reservationId: reservation._id },
            { status: 'PAID' }
        );

        res.status(200).json({ message: "Reservation marked as paid successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
