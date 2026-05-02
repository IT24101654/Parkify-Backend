const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');
const { protect } = require('../middleware/authMiddleware');

router.get('/place/:placeId', protect, slotController.getSlotsByPlace);
router.post('/add', protect, slotController.saveSlot);
router.put('/update/:id', protect, slotController.updateSlot);
router.delete('/delete/:id', protect, slotController.deleteSlot);
router.post('/bulk-create', protect, slotController.bulkCreateSlots);

module.exports = router;
