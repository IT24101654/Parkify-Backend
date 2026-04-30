// utils/reservationScheduler.js
const cron = require('node-cron');
const Reservation = require('../models/Reservation');
const ParkingLocation = require('../models/ParkingLocation');

/**
 * Auto Status Progression — runs every minute.
 *
 * Flow:
 *   PENDING    → CONFIRMED  (immediately on creation via controller)
 *   CONFIRMED  → ACTIVE     (when startTime is reached)
 *   ACTIVE     → COMPLETED  (when endTime is reached, availableSlots incremented)
 *   CANCELLED  (driver-initiated, handled in reservationController)
 */
const runStatusProgression = async () => {
    const now = new Date();

    try {
        // ── Step 1: CONFIRMED → ACTIVE ──────────────────────────────────────
        // Find all CONFIRMED reservations whose startTime has passed
        const toActivate = await Reservation.find({
            status: 'CONFIRMED',
            startTime: { $lte: now }
        });

        for (const reservation of toActivate) {
            reservation.status = 'ACTIVE';
            await reservation.save();
            console.log(`[Scheduler] Reservation ${reservation._id} → ACTIVE`);
        }

        // ── Step 2: ACTIVE → COMPLETED ──────────────────────────────────────
        // Find all ACTIVE reservations whose endTime has passed
        const toComplete = await Reservation.find({
            status: 'ACTIVE',
            endTime: { $lte: now }
        });

        for (const reservation of toComplete) {
            reservation.status = 'COMPLETED';
            await reservation.save();

            // Return the slot back to the parking location
            await ParkingLocation.findByIdAndUpdate(reservation.parkingLocation, {
                $inc: { availableSlots: 1 }
            });

            console.log(`[Scheduler] Reservation ${reservation._id} → COMPLETED (slot returned)`);
        }

    } catch (error) {
        console.error('[Scheduler] Error during status progression:', error.message);
    }
};

/**
 * Starts the reservation status scheduler.
 * Called once from index.js on server startup.
 * Runs every minute: '* * * * *'
 */
const startReservationScheduler = () => {
    cron.schedule('* * * * *', runStatusProgression, {
        scheduled: true,
        timezone: 'Asia/Colombo'  // Sri Lanka timezone (UTC+5:30)
    });

    console.log('[Scheduler] Reservation status scheduler started (runs every minute)');
};

module.exports = { startReservationScheduler };
