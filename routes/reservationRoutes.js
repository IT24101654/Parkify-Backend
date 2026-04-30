// routes/reservationRoutes.js
const express = require('express');
const router = express.Router();

const {
    createReservation,
    getMyReservations,
    getActiveReservations,
    getReservationHistory,
    getReservationById,
    updateReservation,
    cancelReservation
} = require('../controllers/reservationController');

const { protect, authorize } = require('../middleware/authMiddleware');
const {
    validateCreateReservation,
    validateUpdateReservation
} = require('../middleware/validateReservation');

// ─────────────────────────────────────────────────────────────────
// DRIVER ONLY — All reservation routes require DRIVER role
// ─────────────────────────────────────────────────────────────────

// POST   /api/reservations             → Create and confirm a new reservation
router.post('/', protect, authorize('DRIVER'), validateCreateReservation, createReservation);

// GET    /api/reservations             → Get all reservations (full history)
router.get('/', protect, authorize('DRIVER'), getMyReservations);

// GET    /api/reservations/active      → Get only CONFIRMED + ACTIVE reservations
//  NOTE: Static routes (/active, /history) must be defined BEFORE /:id
router.get('/active', protect, authorize('DRIVER'), getActiveReservations);

// GET    /api/reservations/history     → Get COMPLETED + CANCELLED reservations
router.get('/history', protect, authorize('DRIVER'), getReservationHistory);

// GET    /api/reservations/:id         → Get a single reservation's full details
router.get('/:id', protect, authorize('DRIVER'), getReservationById);

// PUT    /api/reservations/:id         → Extend duration or change parking location
router.put('/:id', protect, authorize('DRIVER'), validateUpdateReservation, updateReservation);

// DELETE /api/reservations/:id         → Cancel a reservation
router.delete('/:id', protect, authorize('DRIVER'), cancelReservation);

module.exports = router;
