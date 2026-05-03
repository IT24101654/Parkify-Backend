const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const Otp = require('../models/Otp');
const Notification = require('../models/Notification');
const { sendOtpEmail, sendAdminAlertEmail } = require('../utils/emailService');

const jwt = require('jsonwebtoken');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const sendOtpForRegistration = async (req, res) => {
    const { name, email, password, phoneNumber, address, role, driverPreferences, ownerServices } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    try {
        if (role === 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'SUPER_ADMIN cannot be registered publicly' });
        }

        const existingUser = await User.findOne({ email: lowerEmail, role });
        if (existingUser) {
            return res.status(409).json({ message: `Already registered as ${role}` });
        }

        await PendingUser.findOneAndDelete({ email: lowerEmail, role });
        await PendingUser.create({
            name, email: lowerEmail, password, phoneNumber, address, role, driverPreferences, ownerServices
        });

        const otpCode = generateOtp();
        await Otp.findOneAndDelete({ email: lowerEmail, type: 'REGISTER' });
        await Otp.create({ email: lowerEmail, otp: otpCode, type: 'REGISTER' });

        await sendOtpEmail(lowerEmail, otpCode);

        res.status(200).json({ message: 'OTP sent to email for registration' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyRegistrationOtp = async (req, res) => {
    const { email, otp, role } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    try {
        const validOtp = await Otp.findOne({ email: lowerEmail, type: 'REGISTER' });
        
        if (!validOtp) {
            return res.status(401).json({ message: 'OTP expired or not found. Please register again.' });
        }

        if (validOtp.otp !== otp.toString().trim()) {
            return res.status(401).json({ message: 'Invalid OTP code. Please check your email.' });
        }

        const pendingUser = await PendingUser.findOne({ email: lowerEmail, role });
        if (!pendingUser) {
            return res.status(400).json({ message: 'Registration details not found. Register again.' });
        }

        const user = await User.create({
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password,
            phoneNumber: pendingUser.phoneNumber,
            address: pendingUser.address,
            role: pendingUser.role,
            driverPreferences: pendingUser.driverPreferences,
            ownerServices: pendingUser.ownerServices
        });

        await PendingUser.deleteOne({ _id: pendingUser._id });
        await Otp.deleteOne({ _id: validOtp._id });

        const admins = await User.find({ role: 'SUPER_ADMIN' });
        for (const admin of admins) {
            await Notification.create({
                message: `New user ${user.name} (${user.role}) has registered.`,
                type: 'USER_REGISTRATION',
                admin: admin._id
            });
            // Send Email Alert to Admin
            await sendAdminAlertEmail(admin.email, user);
        }

        res.status(201).json({
            token: generateToken(user._id, user.role),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                address: user.address,
                profilePicture: user.profilePicture,
                ownerServices: user.ownerServices,
                driverPreferences: user.driverPreferences,
                isProfileComplete: user.isProfileComplete
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    try {
        const users = await User.find({ email: lowerEmail });

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid Email or Password' });
        }

        let matchedUser = null;
        for (let u of users) {
            if (await u.matchPassword(password)) {
                matchedUser = u;
                break;
            }
        }

        if (!matchedUser) {
            return res.status(401).json({ message: 'Invalid Email or Password' });
        }

        const roles = users.map(u => u.role);

        if (roles.length === 1) {
            const otpCode = generateOtp();
            await Otp.findOneAndDelete({ email: lowerEmail, type: 'LOGIN' });
            await Otp.create({ email: lowerEmail, otp: otpCode, type: 'LOGIN', role: roles[0] });

            await sendOtpEmail(lowerEmail, otpCode);

            return res.status(200).json({
                status: 'OTP_SENT',
                roles: roles
            });
        }

        res.status(200).json({
            status: 'ROLE_SELECTION_REQUIRED',
            roles: roles
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const selectRole = async (req, res) => {
    const { email, role } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    try {
        const otpCode = generateOtp();
        await Otp.findOneAndDelete({ email: lowerEmail, type: 'LOGIN', role });
        await Otp.create({ email: lowerEmail, otp: otpCode, type: 'LOGIN', role });

        await sendOtpEmail(lowerEmail, otpCode);

        res.status(200).json({ status: 'OTP_SENT' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp, role } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    try {
        const validOtp = await Otp.findOne({ email: lowerEmail, type: 'LOGIN', role });
        
        if (!validOtp) {
            return res.status(401).json({ message: 'OTP expired or not found. Please login again.' });
        }

        if (validOtp.otp !== otp.toString().trim()) {
            return res.status(401).json({ message: 'Invalid OTP code. Please check your email.' });
        }

        const user = await User.findOne({ email: lowerEmail, role });

        await Otp.deleteOne({ _id: validOtp._id });

        res.status(200).json({
            token: generateToken(user._id, user.role),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                address: user.address,
                profilePicture: user.profilePicture,
                ownerServices: user.ownerServices,
                driverPreferences: user.driverPreferences,
                isProfileComplete: user.isProfileComplete
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    try {
        const user = await User.findOne({ email: lowerEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        const otpCode = generateOtp();
        await Otp.findOneAndDelete({ email: lowerEmail, type: 'RESET_PASSWORD' });
        await Otp.create({ email: lowerEmail, otp: otpCode, type: 'RESET_PASSWORD' });

        await sendOtpEmail(lowerEmail, otpCode);

        res.status(200).json({ message: 'Password reset OTP sent to email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyResetOtp = async (req, res) => {
    const { email, otp } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    try {
        const validOtp = await Otp.findOne({ email: lowerEmail, type: 'RESET_PASSWORD' });
        if (!validOtp) {
            return res.status(401).json({ message: 'OTP expired or not found. Please request a new code.' });
        }

        if (validOtp.otp !== otp.toString().trim()) {
            return res.status(401).json({ message: 'Invalid OTP code. Please check your email.' });
        }

        res.status(200).json({ message: 'OTP verified. You can now reset your password.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    try {
        const validOtp = await Otp.findOne({ email: lowerEmail, type: 'RESET_PASSWORD' });
        
        if (!validOtp || validOtp.otp !== otp.toString().trim()) {
            return res.status(401).json({ message: 'Invalid or expired OTP' });
        }

        const users = await User.find({ email: lowerEmail });
        for (let user of users) {
            user.password = newPassword;
            await user.save();
        }

        await Otp.deleteOne({ _id: validOtp._id });

        res.status(200).json({ message: 'Password reset successfully for all associated roles.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const completeProfile = async (req, res) => {
    const { driverPreferences, ownerServices } = req.body;

    try {
        const isProfileComplete = true;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                driverPreferences,
                ownerServices,
                isProfileComplete
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile completed successfully',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                driverPreferences: updatedUser.driverPreferences,
                ownerServices: updatedUser.ownerServices,
                isProfileComplete: updatedUser.isProfileComplete
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const finalizeOnboarding = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { isProfileComplete: true },
            { new: true }
        ).select('-password');

        res.status(200).json({
            message: 'Onboarding finalized successfully',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isProfileComplete: updatedUser.isProfileComplete
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, phoneNumber, address, driverPreferences, active, profilePicture, ownerServices } = req.body;
        
        const updateData = { name, phoneNumber, address, driverPreferences, active, profilePicture };
        if (ownerServices) updateData.ownerServices = ownerServices;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both current and new passwords' });
        }

        // Fetch user and explicitly select password field if it's normally excluded
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if current password matches
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        // Update password (pre-save hook will hash it)
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};
