// routes/parkingLocationRoutes.js
const express = require('express');
const router = express.Router();

const {
    createParkingLocation,
    getMyParkingLocations,
    getAllParkingLocations,
    getParkingLocationById,
    updateParkingLocation,
    deleteParkingLocation,
    getLocationReservations
} = require('../controllers/parkingLocationController');

const { protect, authorize } = require('../middleware/authMiddleware');
const {
    validateCreateParkingLocation,
    validateUpdateParkingLocation
} = require('../middleware/validateReservation');

// ─────────────────────────────────────────────────────────────────
// PUBLIC-ISH (any authenticated user can browse locations)
// ─────────────────────────────────────────────────────────────────

// GET  /api/parking-locations          → Browse all active locations (Drivers use this)
router.get('/', protect, getAllParkingLocations);

// GET  /api/parking-locations/my       → Owner: see only my locations
//  NOTE: This route must be defined BEFORE /:id to avoid 'my' being treated as an ID
router.get('/my', protect, authorize('PARKING_OWNER'), getMyParkingLocations);

// GET  /api/parking-locations/:id      → Get a single location's details
router.get('/:id', protect, getParkingLocationById);

// ─────────────────────────────────────────────────────────────────
// PARKING OWNER ONLY
// ─────────────────────────────────────────────────────────────────

// POST   /api/parking-locations        → Create a new parking location
router.post('/', protect, authorize('PARKING_OWNER'), validateCreateParkingLocation, createParkingLocation);

// PUT    /api/parking-locations/:id    → Update own parking location
router.put('/:id', protect, authorize('PARKING_OWNER'), validateUpdateParkingLocation, updateParkingLocation);

// DELETE /api/parking-locations/:id    → Delete own parking location
router.delete('/:id', protect, authorize('PARKING_OWNER'), deleteParkingLocation);

// GET    /api/parking-locations/:id/reservations  → View reservations at own location
router.get('/:id/reservations', protect, authorize('PARKING_OWNER'), getLocationReservations);

module.exports = router;
