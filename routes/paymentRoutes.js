const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Driver routes
router.get('/my-payments', protect, paymentController.getMyPayments);
router.post('/request-refund', protect, paymentController.requestRefund);

// Owner routes
router.get('/owner/earnings', protect, paymentController.getOwnerEarnings);
router.get('/owner/refunds/pending', protect, paymentController.getPendingRefundsForOwner);
router.post('/owner/refunds/process', protect, paymentController.processRefund);

module.exports = router;
