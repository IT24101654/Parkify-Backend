const Slot = require('../models/Slot');

exports.getSlotsByPlace = async (req, res) => {
    try {
        const slots = await Slot.find({ placeId: req.params.placeId });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.saveSlot = async (req, res) => {
    try {
        const slot = new Slot(req.body);
        const savedSlot = await slot.save();
        res.status(201).json(savedSlot);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateSlot = async (req, res) => {
    try {
        const updatedSlot = await Slot.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedSlot);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteSlot = async (req, res) => {
    try {
        await Slot.findByIdAndDelete(req.params.id);
        res.json({ message: "Slot deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.bulkCreateSlots = async (req, res) => {
    try {
        const { placeId, prefix, count, type } = req.body;
        const slots = [];
        for (let i = 1; i <= count; i++) {
            slots.push({
                slotName: `${prefix}${i}`,
                slotType: type,
                placeId: placeId,
                slotStatus: 'Available'
            });
        }
        const savedSlots = await Slot.insertMany(slots);
        res.status(201).json(savedSlots);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
