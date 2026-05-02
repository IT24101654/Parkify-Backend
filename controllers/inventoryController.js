const Inventory = require('../models/Inventory');

// Add new inventory item
exports.addItem = async (req, res) => {
  try {
    console.log('Adding inventory item. Image present:', !!req.body.image);
    const { itemName, inventoryType, category, quantity, unitPrice, supplier, expiryDate, thresholdValue, lastRestockDate, parkingPlaceId } = req.body;
    
    const newItem = new Inventory({
      itemName,
      inventoryType,
      category,
      quantity,
      unitPrice,
      supplier,
      expiryDate,
      thresholdValue,
      lastRestockDate,
      user: req.user.id,
      parkingPlace: parkingPlaceId,
      image: req.body.image
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get inventory for owner (all their items)
exports.getOwnerInventory = async (req, res) => {
  try {
    const items = await Inventory.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get inventory by parking place (for drivers or specific context)
exports.getInventoryByParkingPlace = async (req, res) => {
  try {
    const items = await Inventory.find({ parkingPlace: req.params.placeId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get inventory by owner ID (for drivers to view owner's items)
exports.getInventoryByOwnerId = async (req, res) => {
  try {
    const items = await Inventory.find({ user: req.params.ownerId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get inventory robustly using Parking Place ID
exports.getInventoryByParkingPlaceIdRobust = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const ParkingPlace = mongoose.model('ParkingPlace');
    const place = await ParkingPlace.findById(req.params.placeId);
    if (!place || !place.ownerId) {
      return res.status(200).json([]);
    }
    const items = await Inventory.find({ user: place.ownerId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update inventory item
exports.updateItem = async (req, res) => {
  console.log('Updating inventory item. Image present:', !!req.body.image);
  try {
    const updatedItem = await Inventory.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete inventory item
exports.deleteItem = async (req, res) => {
  try {
    const deletedItem = await Inventory.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
