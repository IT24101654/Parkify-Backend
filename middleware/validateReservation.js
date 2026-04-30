// middleware/validateReservation.js

// ─────────────────────────────────────────────
// RESERVATION VALIDATORS
// ─────────────────────────────────────────────

/**
 * Validates the request body for creating a new reservation.
 * Checks: required fields, date formats, and logical constraints.
 */
const validateCreateReservation = (req, res, next) => {
    const { parkingLocationId, vehicleId, startTime, endTime } = req.body;

    if (!parkingLocationId) {
        return res.status(400).json({ message: 'Parking location ID is required' });
    }

    if (!vehicleId) {
        return res.status(400).json({ message: 'Vehicle ID is required' });
    }

    if (!startTime) {
        return res.status(400).json({ message: 'Start time is required' });
    }

    if (!endTime) {
        return res.status(400).json({ message: 'End time is required' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (isNaN(start.getTime())) {
        return res.status(400).json({ message: 'Invalid start time format' });
    }

    if (isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Invalid end time format' });
    }

    if (start <= now) {
        return res.status(400).json({ message: 'Start time must be in the future' });
    }

    if (end <= start) {
        return res.status(400).json({ message: 'End time must be after start time' });
    }

    // Minimum booking duration: 30 minutes
    const durationMs = end - start;
    if (durationMs < 30 * 60 * 1000) {
        return res.status(400).json({ message: 'Minimum booking duration is 30 minutes' });
    }

    next();
};

/**
 * Validates the request body for updating a reservation.
 * Allows updating: endTime (extend), parkingLocationId (change location).
 * At least one field must be provided.
 */
const validateUpdateReservation = (req, res, next) => {
    const { endTime, parkingLocationId } = req.body;

    if (!endTime && !parkingLocationId) {
        return res.status(400).json({
            message: 'At least one field must be provided to update: endTime or parkingLocationId'
        });
    }

    if (endTime) {
        const end = new Date(endTime);
        if (isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Invalid end time format' });
        }
    }

    next();
};

// ─────────────────────────────────────────────
// PARKING LOCATION VALIDATORS
// ─────────────────────────────────────────────

/**
 * Validates the request body for creating a new parking location.
 * Checks: required fields and numeric constraints.
 */
const validateCreateParkingLocation = (req, res, next) => {
    const { name, address, city, totalSlots, pricePerHour } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Parking location name is required' });
    }

    if (!address || address.trim() === '') {
        return res.status(400).json({ message: 'Address is required' });
    }

    if (!city || city.trim() === '') {
        return res.status(400).json({ message: 'City is required' });
    }

    if (totalSlots === undefined || totalSlots === null) {
        return res.status(400).json({ message: 'Total slots is required' });
    }

    if (isNaN(Number(totalSlots)) || Number(totalSlots) < 1) {
        return res.status(400).json({ message: 'Total slots must be a positive number (minimum 1)' });
    }

    if (pricePerHour === undefined || pricePerHour === null) {
        return res.status(400).json({ message: 'Price per hour is required' });
    }

    if (isNaN(Number(pricePerHour)) || Number(pricePerHour) < 0) {
        return res.status(400).json({ message: 'Price per hour must be a non-negative number' });
    }

    next();
};

/**
 * Validates the request body for updating a parking location.
 * At least one updatable field must be provided.
 */
const validateUpdateParkingLocation = (req, res, next) => {
    const allowedFields = ['name', 'address', 'city', 'description', 'totalSlots',
        'pricePerHour', 'operatingHours', 'amenities', 'isActive',
        'latitude', 'longitude'];

    const providedFields = Object.keys(req.body).filter(key => allowedFields.includes(key));

    if (providedFields.length === 0) {
        return res.status(400).json({ message: 'At least one field must be provided to update' });
    }

    if (req.body.totalSlots !== undefined) {
        if (isNaN(Number(req.body.totalSlots)) || Number(req.body.totalSlots) < 1) {
            return res.status(400).json({ message: 'Total slots must be a positive number (minimum 1)' });
        }
    }

    if (req.body.pricePerHour !== undefined) {
        if (isNaN(Number(req.body.pricePerHour)) || Number(req.body.pricePerHour) < 0) {
            return res.status(400).json({ message: 'Price per hour must be a non-negative number' });
        }
    }

    next();
};

module.exports = {
    validateCreateReservation,
    validateUpdateReservation,
    validateCreateParkingLocation,
    validateUpdateParkingLocation
};
