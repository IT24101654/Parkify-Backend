const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../utils/emailService');
const jwt = require('jsonwebtoken');

// Generate 6 digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route POST /api/auth/register-otp
const sendOtpForRegistration = async (req, res) => {
    const { name, email, password, phoneNumber, address, role } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    try {
        if (role === 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'SUPER_ADMIN cannot be registered publicly' });
        }

        // Check if user already exists with this role
        const existingUser = await User.findOne({ email: lowerEmail, role });
        if (existingUser) {
            return res.status(409).json({ message: `Already registered as ${role}` });
        }

        // Save pending user
        await PendingUser.findOneAndDelete({ email: lowerEmail, role }); // Remove old pending if any
        await PendingUser.create({
            name, email: lowerEmail, password, phoneNumber, address, role
        });

        // Generate & Save OTP
        const otpCode = generateOtp();
        await Otp.findOneAndDelete({ email: lowerEmail, type: 'REGISTER' });
        await Otp.create({ email: lowerEmail, otp: otpCode, type: 'REGISTER' });

        // Send Email
        await sendOtpEmail(lowerEmail, otpCode);

        res.status(200).json({ message: 'OTP sent to email for registration' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route POST /api/auth/verify-register-otp
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

        // Create User (password hashing is handled in User model pre-save hook)
        const user = await User.create({
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password,
            phoneNumber: pendingUser.phoneNumber,
            address: pendingUser.address,
            role: pendingUser.role
        });

        // Cleanup
        await PendingUser.deleteOne({ _id: pendingUser._id });
        await Otp.deleteOne({ _id: validOtp._id });

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

// @route POST /api/auth/login
const login = async (req, res) => {
    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    try {
        // Find all roles this email has
        const users = await User.find({ email: lowerEmail });
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid Email or Password' });
        }

        // Find the user whose password matches among the different roles
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
            // Auto trigger OTP
            const otpCode = generateOtp();
            await Otp.findOneAndDelete({ email: lowerEmail, type: 'LOGIN' });
            await Otp.create({ email: lowerEmail, otp: otpCode, type: 'LOGIN', role: roles[0] });
            
            await sendOtpEmail(lowerEmail, otpCode);

            return res.status(200).json({
                status: 'OTP_SENT',
                roles: roles
            });
        }

        // Multiple roles -> Need role selection before sending OTP
        res.status(200).json({
            status: 'ROLE_SELECTION_REQUIRED',
            roles: roles
        });

    } catch (error) {
         res.status(500).json({ message: error.message });
    }
};

// @route POST /api/auth/select-role
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

// @route POST /api/auth/verify-otp
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

module.exports = {
    sendOtpForRegistration,
    verifyRegistrationOtp,
    login,
    selectRole,
    verifyOtp
};
