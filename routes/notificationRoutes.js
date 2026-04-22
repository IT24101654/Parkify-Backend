const express = require('express');
const { getMyNotifications, markAsRead } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorize('SUPER_ADMIN'), getMyNotifications);
router.put('/:id/read', protect, authorize('SUPER_ADMIN'), markAsRead);

module.exports = router;
