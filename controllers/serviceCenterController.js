const ServiceCenter = require('../models/ServiceCenter');
const ServiceItem = require('../models/ServiceItem');
const ServiceAppointment = require('../models/ServiceAppointment');

// ── Service Center ──────────────────────────────────────────────────────────

exports.getServiceCenterByUser = async (req, res) => {
  console.log('Fetching service center for user:', req.user.id);
  try {
    let center = await ServiceCenter.findOne({ user: req.user.id });
    if (!center) {
      // Create a default center for the user if it doesn't exist
      center = new ServiceCenter({
        user: req.user.id,
        name: `Service Center`,
        contactNumber: req.user.phone || '',
        workingHours: '9:00 AM - 6:00 PM',
        location: 'Not Set'
      });
      await center.save();
    }
    res.json(center);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getServiceCenterByOwner = async (req, res) => {
  try {
    console.log("Fetching service center for ownerId:", req.params.ownerId);
    const center = await ServiceCenter.findOne({ user: req.params.ownerId });
    if (!center) {
      return res.status(200).json(null);
    }
    res.json(center);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch Service Center robustly using Parking Place ID
exports.getServiceCenterByParkingPlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    console.log("DEBUG: Fetching service center for placeId:", placeId);
    
    const ParkingPlace = require('../models/ParkingPlace');
    const place = await ParkingPlace.findById(placeId);
    
    if (!place) {
      console.log("DEBUG: Parking place not found for ID:", placeId);
      return res.status(200).json(null);
    }
    
    console.log("DEBUG: Found place, ownerId is:", place.ownerId);
    const center = await ServiceCenter.findOne({ user: place.ownerId });
    
    if (!center) {
      console.log("DEBUG: No service center found for owner:", place.ownerId);
    } else {
      console.log("DEBUG: Found service center:", center._id);
    }
    
    res.status(200).json(center || null);
  } catch (error) {
    console.error("DEBUG: Error in getServiceCenterByParkingPlace:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateServiceCenter = async (req, res) => {
  try {
    const updatedCenter = await ServiceCenter.findOneAndUpdate(
      { user: req.user.id },
      { ...req.body, user: req.user.id },
      { new: true, upsert: true } // Create if not exists
    );
    res.json(updatedCenter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Service Items ───────────────────────────────────────────────────────────

exports.addServiceItem = async (req, res) => {
  try {
    const center = await ServiceCenter.findOne({ user: req.user.id });
    if (!center) return res.status(404).json({ message: 'Service center not found' });

    const newItem = new ServiceItem({
      ...req.body,
      user: req.user.id,
      serviceCenter: center._id
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getServiceItemsByCenter = async (req, res) => {
  try {
    const items = await ServiceItem.find({ serviceCenter: req.params.centerId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateServiceItem = async (req, res) => {
  try {
    const updatedItem = await ServiceItem.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!updatedItem) return res.status(404).json({ message: 'Service item not found' });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteServiceItem = async (req, res) => {
  try {
    const deletedItem = await ServiceItem.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedItem) return res.status(404).json({ message: 'Service item not found' });
    res.json({ message: 'Service item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Service Appointments ────────────────────────────────────────────────────

exports.getAppointmentsByCenter = async (req, res) => {
  try {
    // In a real app, you'd filter by center name or ID
    // For now, let's just fetch all linked to this owner's logic
    const appointments = await ServiceAppointment.find().sort({ serviceDate: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
