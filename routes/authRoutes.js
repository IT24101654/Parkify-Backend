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
    resetPassword,
    completeProfile,
    finalizeOnboarding,
    updateProfile,
    changePassword,
    getProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getProfile);
router.post('/register-otp', sendOtpForRegistration);
router.post('/verify-register-otp', verifyRegistrationOtp);
router.post('/login', login);
router.post('/select-role', selectRole);
router.post('/verify-otp', verifyOtp);

router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.put('/complete-profile', protect, completeProfile);
router.put('/finalize-onboarding', protect, finalizeOnboarding);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
