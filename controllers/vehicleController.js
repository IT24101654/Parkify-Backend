const Vehicle = require('../models/Vehicle');
const fs = require('fs');
const path = require('path');

const addVehicle = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ 
                message: 'Request body is empty or missing', 
                contentType: req.headers['content-type'],
                bodyReceived: req.body 
            });
        }
        const { vehicleNumber, brand, model, type, fuelType } = req.body;
        const ownerId = req.user._id;

        const existingVehicle = await Vehicle.findOne({ vehicleNumber });
        if (existingVehicle) {
            return res.status(400).json({ message: 'Vehicle number already registered' });
        }

        const vehicleImage = req.files && req.files['vehicleImage'] ? req.files['vehicleImage'][0].path : null;
        const licenseImage = req.files && req.files['licenseImage'] ? req.files['licenseImage'][0].path : null;

        const vehicle = await Vehicle.create({
            vehicleNumber,
            brand,
            model,
            type,
            fuelType,
            vehicleImage,
            licenseImage,
            owner: ownerId
        });

        res.status(201).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ owner: req.user._id });
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.status(200).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('--- Update Start ---');
        console.log('ID:', id);
        console.log('Body:', req.body);
        console.log('Files:', req.files ? Object.keys(req.files) : 'No files');

        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        const { vehicleNumber, brand, model, type, fuelType } = req.body;

        const updateData = {
            vehicleNumber: vehicleNumber || vehicle.vehicleNumber,
            brand: brand || vehicle.brand,
            model: model || vehicle.model,
            type: type || vehicle.type,
            fuelType: fuelType || vehicle.fuelType,
        };

        if (req.files) {
            if (req.files['vehicleImage']) {
                if (vehicle.vehicleImage && !vehicle.vehicleImage.startsWith('http')) {
                    const oldPath = path.join(__dirname, '..', vehicle.vehicleImage);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
                updateData.vehicleImage = req.files['vehicleImage'][0].path;
            }
            if (req.files['licenseImage']) {
                if (vehicle.licenseImage && !vehicle.licenseImage.startsWith('http')) {
                    const oldPath = path.join(__dirname, '..', vehicle.licenseImage);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
                updateData.licenseImage = req.files['licenseImage'][0].path;
            }
        }

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        console.log('--- Update Success ---');
        res.status(200).json(updatedVehicle);
    } catch (error) {
        console.error('--- Update Error ---');
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        if (vehicle.owner.toString() !== req.user._id.toString() && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Not authorized to delete this vehicle' });
        }

        // Delete associated files
        if (vehicle.vehicleImage && fs.existsSync(vehicle.vehicleImage)) {
            fs.unlinkSync(vehicle.vehicleImage);
        }
        if (vehicle.licenseImage && fs.existsSync(vehicle.licenseImage)) {
            fs.unlinkSync(vehicle.licenseImage);
        }

        await vehicle.deleteOne();
        res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addVehicle,
    getUserVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle
};
