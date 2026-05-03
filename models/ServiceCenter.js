const mongoose = require('mongoose');

const serviceCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  contactNumber: { type: String },
  workingHours: { type: String },
  servicesOffered: { type: String },
  address: { type: String },
  type: { type: String }, // General, Specialized, etc.
  active: { type: Boolean, default: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('ServiceCenter', serviceCenterSchema);
