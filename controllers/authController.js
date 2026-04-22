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
    const { name, email, password, phoneNumber, address, role } = req.body;
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
            name, email: lowerEmail, password, phoneNumber, address, role
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
        const validOtp = await Otp.findOne({ email: lowerEmail, otp, type: 'REGISTER' });
        if (!validOtp) {
            return res.status(401).json({ message: 'Invalid or expired OTP' });
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
            role: pendingUser.role
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
                role: user.role
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
        const validOtp = await Otp.findOne({ email: lowerEmail, otp, type: 'LOGIN', role });
        if (!validOtp) {
            return res.status(401).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOne({ email: lowerEmail, role });

        await Otp.deleteOne({ _id: validOtp._id });

        res.status(200).json({
            token: generateToken(user._id, user.role),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
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
        const validOtp = await Otp.findOne({ email: lowerEmail, otp, type: 'RESET_PASSWORD' });
        if (!validOtp) {
            return res.status(401).json({ message: 'Invalid or expired OTP' });
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
        const validOtp = await Otp.findOne({ email: lowerEmail, otp, type: 'RESET_PASSWORD' });
        if (!validOtp) {
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

module.exports = {
    sendOtpForRegistration,
    verifyRegistrationOtp,
    login,
    selectRole,
    verifyOtp,
    forgotPassword,
    verifyResetOtp,
    resetPassword
};
