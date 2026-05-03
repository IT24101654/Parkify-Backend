const ServiceAppointment = require('../models/ServiceAppointment');
const ParkingPlace = require('../models/ParkingPlace');

// Generate unique booking ID (like CAC4C4)
const generateBookingId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

exports.createAppointment = async (req, res) => {
    try {
        const payload = req.body;
        const appointment = new ServiceAppointment({
            bookingId: generateBookingId(),
            customerName: payload.customerName,
            phone: payload.phone,
            vehicleId: payload.vehicleId,
            vehicleType: payload.vehicleType,
            serviceType: payload.serviceType,
            serviceCenter: payload.serviceCenter,
            parkingPlaceId: payload.parkingPlaceId,
            driverId: req.user.id,
            serviceDate: payload.serviceDate,
            timeSlot: payload.timeSlot,
            notes: payload.notes
        });

        await appointment.save();
        res.status(201).json(appointment);
    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(400).json({ error: error.message || "Server error" });
    }
};

exports.getDriverAppointments = async (req, res) => {
    try {
        const driverId = req.user.id;
        const appointments = await ServiceAppointment.find({ driverId }).sort({ createdAt: -1 });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(400).json({ error: error.message || "Server error" });
    }
};

exports.getOwnerAppointments = async (req, res) => {
    try {
        const ownerId = req.user.id;
        console.log('--- Owner Service Appointments Query ---');
        console.log('Fetching for Owner ID:', ownerId);

        // Find all parking places owned by this user
        const places = await ParkingPlace.find({ ownerId });
        console.log('Total Parking Places found for this owner:', places.length);
        
        if (places.length === 0) {
            console.log('No parking places found for this owner.');
            return res.status(200).json([]);
        }

        const placeIds = places.map(p => p._id);
        console.log('Filtering appointments for Place IDs:', placeIds);

        const appointments = await ServiceAppointment.find({ 
            parkingPlaceId: { $in: placeIds } 
        }).sort({ createdAt: -1 });

        console.log(`Successfully found ${appointments.length} appointments for owner's centers.`);
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error in getOwnerAppointments:', error);
        res.status(400).json({ error: error.message || "Server error" });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id, action } = req.params; // action: 'complete', 'cancel'
        let updateData = {};
        
        if (action === 'complete') {
            updateData = { status: 'COMPLETED', completedAt: new Date() };
        } else if (action === 'cancel') {
            updateData = { status: 'CANCELLED', cancelledAt: new Date() };
        } else {
            return res.status(400).json({ error: "Invalid action" });
        }

        const appointment = await ServiceAppointment.findByIdAndUpdate(id, updateData, { new: true });
        if (!appointment) return res.status(404).json({ error: "Appointment not found" });
        
        res.status(200).json(appointment);
    } catch (error) {
        res.status(400).json({ error: error.message || "Server error" });
    }
};
