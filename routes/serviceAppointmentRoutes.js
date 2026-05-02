const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/serviceAppointmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, appointmentController.createAppointment);
router.get('/my', protect, appointmentController.getDriverAppointments);
router.get('/owner', protect, appointmentController.getOwnerAppointments);
router.patch('/:id/:action', protect, appointmentController.updateAppointmentStatus);

module.exports = router;
