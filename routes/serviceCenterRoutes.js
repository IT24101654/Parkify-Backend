const express = require('express');
const router = express.Router();
const serviceCenterController = require('../controllers/serviceCenterController');
const { protect } = require('../middleware/authMiddleware');

// Service Center Details
router.get('/my-center', protect, serviceCenterController.getServiceCenterByUser);
router.get('/by-owner/:ownerId', protect, serviceCenterController.getServiceCenterByOwner);
router.get('/by-parking-place/:placeId', protect, serviceCenterController.getServiceCenterByParkingPlace);
router.put('/my-center', protect, serviceCenterController.updateServiceCenter);

// Service Items
router.post('/service-items/add', protect, serviceCenterController.addServiceItem);
router.get('/service-items/center/:centerId', protect, serviceCenterController.getServiceItemsByCenter);
router.put('/service-items/:id', protect, serviceCenterController.updateServiceItem);
router.delete('/service-items/:id', protect, serviceCenterController.deleteServiceItem);

// Appointments
router.get('/appointments', protect, serviceCenterController.getAppointmentsByCenter);

module.exports = router;
