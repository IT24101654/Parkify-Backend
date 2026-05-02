const mongoose = require('mongoose');

const serviceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // Car Wash, Oil Change, etc.
  description: { type: String },
  price: { type: Number, required: true },
  estimatedTime: { type: String },
  image: { type: String },
  active: { type: Boolean, default: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceCenter: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCenter', required: true }
}, { timestamps: true });

module.exports = mongoose.model('ServiceItem', serviceItemSchema);
