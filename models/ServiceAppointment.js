const mongoose = require('mongoose');

const serviceAppointmentSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phone: { type: String },
  vehicleId: { type: String, required: true },
  vehicleType: { type: String, required: true },
  serviceType: { type: String, required: true },
  serviceCenter: { type: String, required: true },
  parkingPlaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingPlace', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  serviceDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, default: 'BOOKED' },
}, { timestamps: true });

module.exports = mongoose.model('ServiceAppointment', serviceAppointmentSchema);
