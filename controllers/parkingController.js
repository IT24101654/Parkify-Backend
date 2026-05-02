const ParkingPlace = require('../models/ParkingPlace');
const Slot = require('../models/Slot');
const path = require('path');
const fs = require('fs');

exports.getAllParkingPlaces = async (req, res) => {
    try {
        const places = await ParkingPlace.find();
        res.json(places);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getParkingPlacesByOwner = async (req, res) => {
    try {
        const places = await ParkingPlace.find({ ownerId: req.params.ownerId });
        res.json(places);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.saveParkingPlace = async (req, res) => {
    try {
        const place = new ParkingPlace(req.body);
        const savedPlace = await place.save();
        res.status(201).json(savedPlace);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateParkingPlace = async (req, res) => {
    try {
        const updatedPlace = await ParkingPlace.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedPlace);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteParkingPlace = async (req, res) => {
    try {
        await ParkingPlace.findByIdAndDelete(req.params.id);
        // Also delete associated slots
        await Slot.deleteMany({ placeId: req.params.id });
        res.json({ message: "Parking Place and its slots deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateFeatureFlags = async (req, res) => {
    try {
        const { hasInventory, hasServiceCenter } = req.body;
        const updatedPlace = await ParkingPlace.findByIdAndUpdate(
            req.params.id,
            { hasInventory, hasServiceCenter },
            { new: true }
        );
        res.json(updatedPlace);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.uploadParkingImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        
        const fileName = req.file.filename;
        await ParkingPlace.findByIdAndUpdate(req.params.id, { placeImage: fileName });
        
        res.json({
            message: "Parking image uploaded successfully",
            fileName: fileName
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
