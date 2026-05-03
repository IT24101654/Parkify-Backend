const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getAllUsers,
    deleteUser,
    getAdminProfile,
    updateAdminProfile
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes here are protected and restricted to SUPER_ADMIN
router.use(protect);
router.use(authorize('SUPER_ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);

module.exports = router;
