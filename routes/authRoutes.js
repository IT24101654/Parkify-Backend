const express = require('express');
const router = express.Router();
const {
    sendOtpForRegistration,
    verifyRegistrationOtp,
    login,
    selectRole,
    verifyOtp,
    forgotPassword,
    verifyResetOtp,
    resetPassword
} = require('../controllers/authController');

router.post('/register-otp', sendOtpForRegistration);
router.post('/verify-register-otp', verifyRegistrationOtp);
router.post('/login', login);
router.post('/select-role', selectRole);
router.post('/verify-otp', verifyOtp);

router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
