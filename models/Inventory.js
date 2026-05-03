const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  inventoryType: { type: String, required: true }, // FOOD, SPARE_PART, FUEL
  category: { type: String }, // SUV, Sedan, etc.
  quantity: { type: Number, required: true, default: 0 },
  unitPrice: { type: Number, required: true, default: 0 },
  supplier: { type: String },
  expiryDate: { type: Date },
  thresholdValue: { type: Number, required: true, default: 0 },
  lastRestockDate: { type: Date },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parkingPlace: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingPlace' },
  image: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
