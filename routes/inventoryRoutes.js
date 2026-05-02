const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, inventoryController.addItem);
router.get('/owner', protect, inventoryController.getOwnerInventory);
router.get('/by-parking-place/:placeId', protect, inventoryController.getInventoryByParkingPlace);
router.get('/robust/by-parking-place/:placeId', protect, inventoryController.getInventoryByParkingPlaceIdRobust);
router.get('/by-owner/:ownerId', protect, inventoryController.getInventoryByOwnerId);
router.put('/:id', protect, inventoryController.updateItem);
router.delete('/:id', protect, inventoryController.deleteItem);

module.exports = router;
