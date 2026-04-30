// controllers/parkingLocationController.js
const ParkingLocation = require('../models/ParkingLocation');
const Reservation = require('../models/Reservation');

// ─────────────────────────────────────────────────────────────────
// PARKING OWNER — Create a new parking location
// POST /api/parking-locations
// ─────────────────────────────────────────────────────────────────
const createParkingLocation = async (req, res) => {
    try {
        const {
            name,
            address,
            city,
            latitude,
            longitude,
            description,
            totalSlots,
            pricePerHour,
            operatingHours,
            amenities
        } = req.body;

        const slots = Number(totalSlots);
        const price = Number(pricePerHour);

        const parkingLocation = await ParkingLocation.create({
            name,
            address,
            city,
            latitude,
            longitude,
            description,
            totalSlots: slots,
            availableSlots: slots,   // At creation, all slots are available
            pricePerHour: price,
            operatingHours,
            amenities: amenities || [],
            owner: req.user._id
        });

        res.status(201).json(parkingLocation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// PARKING OWNER — Get all locations owned by the logged-in owner
// GET /api/parking-locations/my
// ─────────────────────────────────────────────────────────────────
const getMyParkingLocations = async (req, res) => {
    try {
        const locations = await ParkingLocation.find({ owner: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// ALL AUTHENTICATED USERS — Get all active parking locations
// Drivers use this to browse available spots
// GET /api/parking-locations
// Optional query params: ?city=Colombo&minSlots=1
// ─────────────────────────────────────────────────────────────────
const getAllParkingLocations = async (req, res) => {
    try {
        const filter = { isActive: true };

        // Optional city filter
        if (req.query.city) {
            filter.city = { $regex: req.query.city, $options: 'i' };
        }

        // Optional available slots filter
        if (req.query.minSlots) {
            filter.availableSlots = { $gte: Number(req.query.minSlots) };
        }

        const locations = await ParkingLocation.find(filter)
            .populate('owner', 'name email phoneNumber')
            .sort({ createdAt: -1 });

        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// ALL AUTHENTICATED USERS — Get a single parking location by ID
// GET /api/parking-locations/:id
// ─────────────────────────────────────────────────────────────────
const getParkingLocationById = async (req, res) => {
    try {
        const location = await ParkingLocation.findById(req.params.id)
            .populate('owner', 'name email phoneNumber');

        if (!location) {
            return res.status(404).json({ message: 'Parking location not found' });
        }

        res.status(200).json(location);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// PARKING OWNER — Update a parking location they own
// PUT /api/parking-locations/:id
// ─────────────────────────────────────────────────────────────────
const updateParkingLocation = async (req, res) => {
    try {
        const location = await ParkingLocation.findById(req.params.id);

        if (!location) {
            return res.status(404).json({ message: 'Parking location not found' });
        }

        // Ensure only the owner can update
        if (location.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this parking location' });
        }

        const {
            name,
            address,
            city,
            latitude,
            longitude,
            description,
            totalSlots,
            pricePerHour,
            operatingHours,
            amenities,
            isActive
        } = req.body;

        // Handle totalSlots update — adjust availableSlots proportionally
        if (totalSlots !== undefined) {
            const newTotal = Number(totalSlots);
            const slotDifference = newTotal - location.totalSlots;
            location.totalSlots = newTotal;
            // Increase or decrease available slots by the same difference
            location.availableSlots = Math.max(0, location.availableSlots + slotDifference);
        }

        location.name              = name              || location.name;
        location.address           = address           || location.address;
        location.city              = city              || location.city;
        location.latitude          = latitude          !== undefined ? latitude          : location.latitude;
        location.longitude         = longitude         !== undefined ? longitude         : location.longitude;
        location.description       = description       !== undefined ? description       : location.description;
        location.pricePerHour      = pricePerHour      !== undefined ? Number(pricePerHour) : location.pricePerHour;
        location.operatingHours    = operatingHours    || location.operatingHours;
        location.amenities         = amenities         !== undefined ? amenities         : location.amenities;
        location.isActive          = isActive          !== undefined ? isActive          : location.isActive;

        const updatedLocation = await location.save();
        res.status(200).json(updatedLocation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// PARKING OWNER — Delete a parking location they own
// DELETE /api/parking-locations/:id
// Cannot delete if there are active/confirmed reservations
// ─────────────────────────────────────────────────────────────────
const deleteParkingLocation = async (req, res) => {
    try {
        const location = await ParkingLocation.findById(req.params.id);

        if (!location) {
            return res.status(404).json({ message: 'Parking location not found' });
        }

        // Ensure only the owner can delete
        if (location.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this parking location' });
        }

        // Prevent deletion if there are active or confirmed reservations
        const activeReservations = await Reservation.countDocuments({
            parkingLocation: req.params.id,
            status: { $in: ['CONFIRMED', 'ACTIVE'] }
        });

        if (activeReservations > 0) {
            return res.status(400).json({
                message: `Cannot delete location. There are ${activeReservations} active or confirmed reservation(s). Please wait for them to complete or contact drivers to cancel.`
            });
        }

        await location.deleteOne();
        res.status(200).json({ message: 'Parking location deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// PARKING OWNER — View all reservations for their parking location
// GET /api/parking-locations/:id/reservations
// Optional query param: ?status=ACTIVE
// ─────────────────────────────────────────────────────────────────
const getLocationReservations = async (req, res) => {
    try {
        const location = await ParkingLocation.findById(req.params.id);

        if (!location) {
            return res.status(404).json({ message: 'Parking location not found' });
        }

        // Ensure only the owner can view reservations for their location
        if (location.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view reservations for this location' });
        }

        const filter = { parkingLocation: req.params.id };

        // Optional status filter
        if (req.query.status) {
            filter.status = req.query.status.toUpperCase();
        }

        const reservations = await Reservation.find(filter)
            .populate('driver', 'name email phoneNumber')
            .populate('vehicle', 'vehicleNumber brand model type')
            .sort({ createdAt: -1 });

        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createParkingLocation,
    getMyParkingLocations,
    getAllParkingLocations,
    getParkingLocationById,
    updateParkingLocation,
    deleteParkingLocation,
    getLocationReservations
};
