// controllers/reservationController.js
const Reservation = require('../models/Reservation');
const ParkingLocation = require('../models/ParkingLocation');
const Vehicle = require('../models/Vehicle');

// ─────────────────────────────────────────────────────────────────
// Helper: Calculate total amount based on duration and price
// ─────────────────────────────────────────────────────────────────
const calculateTotalAmount = (startTime, endTime, pricePerHour) => {
    const durationMs = new Date(endTime) - new Date(startTime);
    const durationHours = durationMs / (1000 * 60 * 60);   // Convert ms → hours
    return parseFloat((durationHours * pricePerHour).toFixed(2));
};

// ─────────────────────────────────────────────────────────────────
// DRIVER — Create a new reservation
// POST /api/reservations
// Auto-sets status to CONFIRMED immediately after creation.
// Decrements availableSlots on the parking location.
// ─────────────────────────────────────────────────────────────────
const createReservation = async (req, res) => {
    try {
        const { parkingLocationId, vehicleId, startTime, endTime } = req.body;

        // ── 1. Verify the parking location exists and is active ──────────────
        const parkingLocation = await ParkingLocation.findById(parkingLocationId);
        if (!parkingLocation) {
            return res.status(404).json({ message: 'Parking location not found' });
        }
        if (!parkingLocation.isActive) {
            return res.status(400).json({ message: 'This parking location is not currently active' });
        }

        // ── 2. Check slot availability ───────────────────────────────────────
        if (parkingLocation.availableSlots <= 0) {
            return res.status(400).json({ message: 'No available slots at this parking location' });
        }

        // ── 3. Verify the vehicle belongs to the logged-in driver ────────────
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        if (vehicle.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to book with this vehicle' });
        }

        // ── 4. Check driver doesn't already have an active booking at this location ──
        const conflictingReservation = await Reservation.findOne({
            driver: req.user._id,
            parkingLocation: parkingLocationId,
            status: { $in: ['CONFIRMED', 'ACTIVE'] }
        });
        if (conflictingReservation) {
            return res.status(400).json({
                message: 'You already have an active or confirmed reservation at this parking location'
            });
        }

        // ── 5. Calculate total amount ────────────────────────────────────────
        const totalAmount = calculateTotalAmount(startTime, endTime, parkingLocation.pricePerHour);

        // ── 6. Create reservation with status CONFIRMED (auto-progression) ───
        const reservation = await Reservation.create({
            driver: req.user._id,
            vehicle: vehicleId,
            parkingLocation: parkingLocationId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            totalAmount,
            status: 'CONFIRMED'    // Skip PENDING — auto-confirmed on creation
        });

        // ── 7. Decrement available slots ─────────────────────────────────────
        await ParkingLocation.findByIdAndUpdate(parkingLocationId, {
            $inc: { availableSlots: -1 }
        });

        // ── 8. Populate and return the created reservation ───────────────────
        const populatedReservation = await Reservation.findById(reservation._id)
            .populate('parkingLocation', 'name address city pricePerHour')
            .populate('vehicle', 'vehicleNumber brand model type');

        res.status(201).json(populatedReservation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// DRIVER — Get ALL reservations (complete history)
// GET /api/reservations
// ─────────────────────────────────────────────────────────────────
const getMyReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ driver: req.user._id })
            .populate('parkingLocation', 'name address city pricePerHour operatingHours')
            .populate('vehicle', 'vehicleNumber brand model type')
            .sort({ createdAt: -1 });

        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// DRIVER — Get only ACTIVE reservations (currently ongoing)
// GET /api/reservations/active
// ─────────────────────────────────────────────────────────────────
const getActiveReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({
            driver: req.user._id,
            status: { $in: ['CONFIRMED', 'ACTIVE'] }
        })
            .populate('parkingLocation', 'name address city pricePerHour operatingHours')
            .populate('vehicle', 'vehicleNumber brand model type')
            .sort({ startTime: 1 });   // Soonest first

        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// DRIVER — Get booking history (completed + cancelled)
// GET /api/reservations/history
// ─────────────────────────────────────────────────────────────────
const getReservationHistory = async (req, res) => {
    try {
        const reservations = await Reservation.find({
            driver: req.user._id,
            status: { $in: ['COMPLETED', 'CANCELLED'] }
        })
            .populate('parkingLocation', 'name address city pricePerHour')
            .populate('vehicle', 'vehicleNumber brand model type')
            .sort({ createdAt: -1 });

        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// DRIVER — Get a single reservation by ID
// GET /api/reservations/:id
// ─────────────────────────────────────────────────────────────────
const getReservationById = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate('parkingLocation', 'name address city pricePerHour operatingHours amenities')
            .populate('vehicle', 'vehicleNumber brand model type fuelType')
            .populate('driver', 'name email phoneNumber');

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Only the driver who made the reservation can view it
        if (reservation.driver._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this reservation' });
        }

        res.status(200).json(reservation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// DRIVER — Update a reservation
// PUT /api/reservations/:id
// Supports: Extend duration (new endTime) or Change parking location
// Only allowed on CONFIRMED reservations (not yet ACTIVE)
// ─────────────────────────────────────────────────────────────────
const updateReservation = async (req, res) => {
    try {
        const { endTime, parkingLocationId } = req.body;

        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Ownership check
        if (reservation.driver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this reservation' });
        }

        // Can only update CONFIRMED reservations (not yet started)
        if (reservation.status !== 'CONFIRMED') {
            return res.status(400).json({
                message: `Cannot update a reservation with status '${reservation.status}'. Only CONFIRMED reservations can be modified.`
            });
        }

        // ── Case 1: Extend duration (new endTime) ────────────────────────────
        if (endTime) {
            const newEnd = new Date(endTime);

            if (newEnd <= reservation.startTime) {
                return res.status(400).json({ message: 'New end time must be after start time' });
            }

            if (newEnd <= reservation.endTime) {
                return res.status(400).json({ message: 'New end time must be later than current end time to extend' });
            }

            // Recalculate total amount based on new duration
            const parkingLocation = await ParkingLocation.findById(reservation.parkingLocation);
            reservation.endTime = newEnd;
            reservation.totalAmount = calculateTotalAmount(
                reservation.startTime,
                newEnd,
                parkingLocation.pricePerHour
            );
        }

        // ── Case 2: Change parking location ─────────────────────────────────
        if (parkingLocationId && parkingLocationId !== reservation.parkingLocation.toString()) {
            const newLocation = await ParkingLocation.findById(parkingLocationId);

            if (!newLocation) {
                return res.status(404).json({ message: 'New parking location not found' });
            }
            if (!newLocation.isActive) {
                return res.status(400).json({ message: 'New parking location is not active' });
            }
            if (newLocation.availableSlots <= 0) {
                return res.status(400).json({ message: 'No available slots at the new parking location' });
            }

            // Return slot to old location
            await ParkingLocation.findByIdAndUpdate(reservation.parkingLocation, {
                $inc: { availableSlots: 1 }
            });

            // Take slot from new location
            await ParkingLocation.findByIdAndUpdate(parkingLocationId, {
                $inc: { availableSlots: -1 }
            });

            reservation.parkingLocation = parkingLocationId;

            // Recalculate amount with new location's price
            reservation.totalAmount = calculateTotalAmount(
                reservation.startTime,
                reservation.endTime,
                newLocation.pricePerHour
            );
        }

        const updatedReservation = await reservation.save();

        const populatedReservation = await Reservation.findById(updatedReservation._id)
            .populate('parkingLocation', 'name address city pricePerHour')
            .populate('vehicle', 'vehicleNumber brand model type');

        res.status(200).json(populatedReservation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// DRIVER — Cancel a reservation
// DELETE /api/reservations/:id
// Allowed on CONFIRMED or ACTIVE reservations.
// Increments availableSlots back on the parking location.
// ─────────────────────────────────────────────────────────────────
const cancelReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Ownership check
        if (reservation.driver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
        }

        // Cannot cancel COMPLETED or already CANCELLED reservations
        if (reservation.status === 'COMPLETED') {
            return res.status(400).json({ message: 'Cannot cancel a completed reservation' });
        }
        if (reservation.status === 'CANCELLED') {
            return res.status(400).json({ message: 'Reservation is already cancelled' });
        }

        // Update status and record cancellation details
        reservation.status = 'CANCELLED';
        reservation.cancelledAt = new Date();
        reservation.cancellationReason = req.body.reason || 'Cancelled by driver';

        await reservation.save();

        // Return the slot back to the parking location
        await ParkingLocation.findByIdAndUpdate(reservation.parkingLocation, {
            $inc: { availableSlots: 1 }
        });

        res.status(200).json({ message: 'Reservation cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReservation,
    getMyReservations,
    getActiveReservations,
    getReservationHistory,
    getReservationById,
    updateReservation,
    cancelReservation
};
