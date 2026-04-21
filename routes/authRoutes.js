const express = require('express');
const router = express.Router();
const {
    sendOtpForRegistration,
    verifyRegistrationOtp,
    login,
    selectRole,
    verifyOtp
} = require('../controllers/authController');

router.post('/register-otp', sendOtpForRegistration);
router.post('/verify-register-otp', verifyRegistrationOtp);
router.post('/login', login);
router.post('/select-role', selectRole);
router.post('/verify-otp', verifyOtp);

module.exports = router;
