const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/SuperAdmin
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalVehicles = await Vehicle.countDocuments();
        
        const driversCount = await User.countDocuments({ role: 'DRIVER' });
        const ownersCount = await User.countDocuments({ role: 'PARKING_OWNER' });
        const adminsCount = await User.countDocuments({ role: 'SUPER_ADMIN' });

        res.status(200).json({
            totalUsers,
            totalVehicles,
            stats: {
                drivers: driversCount,
                owners: ownersCount,
                admins: adminsCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/SuperAdmin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/SuperAdmin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            if (user.role === 'SUPER_ADMIN') {
                return res.status(403).json({ message: 'Cannot delete a Super Admin' });
            }
            await User.deleteOne({ _id: user._id });
            res.status(200).json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private/SuperAdmin
const getAdminProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private/SuperAdmin
const updateAdminProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
            user.address = req.body.address || user.address;
            user.nicNumber = req.body.nicNumber || user.nicNumber;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.status(200).json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phoneNumber: updatedUser.phoneNumber,
                address: updatedUser.address,
                nicNumber: updatedUser.nicNumber
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    deleteUser,
    getAdminProfile,
    updateAdminProfile
};
