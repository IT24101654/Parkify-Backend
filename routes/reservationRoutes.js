const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { protect: auth } = require('../middleware/authMiddleware');

router.post('/book', auth, reservationController.bookParking);
router.get('/my', auth, reservationController.getMyReservations);
router.get('/owner', auth, reservationController.getReservationsForOwner);
router.get('/owner/:ownerId', auth, reservationController.getReservationsForOwner);

router.get('/:id', auth, reservationController.getReservationById);
router.post('/:id/pay', auth, reservationController.initiatePayment);

router.put('/cancel/:id', auth, reservationController.cancelReservation);
router.put('/update/:id', auth, reservationController.updateReservation);

router.patch('/:id/confirm', auth, reservationController.confirmReservation);
router.patch('/:id/cancel-by-owner', auth, reservationController.cancelReservationByOwner);

router.put('/mark-paid/:reservationId', auth, reservationController.markReservationAsPaid);

module.exports = router;
