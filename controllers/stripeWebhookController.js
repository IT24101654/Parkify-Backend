const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Reservation = require('../models/Reservation');

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        // req.body must be raw string for Stripe signature verification
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook signature verification failed:`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // Fulfill the purchase...
        const reservationId = session.metadata.reservationId;
        const stripeSessionId = session.id;

        try {
            // Update Payment record
            const payment = await Payment.findOneAndUpdate(
                { stripeSessionId: stripeSessionId },
                { status: 'PAID', stripePaymentIntentId: session.payment_intent },
                { new: true }
            );

            // Update Reservation record
            if (reservationId) {
                await Reservation.findByIdAndUpdate(
                    reservationId,
                    { paymentStatus: 'PAID', status: 'CONFIRMED' }
                );
            }
            
            console.log(`Payment successful for reservation: ${reservationId}`);
        } catch (error) {
            console.error('Error updating payment/reservation status:', error);
        }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({received: true});
};
