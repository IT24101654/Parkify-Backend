const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOtpEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"Parkify Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Parkify Authentication OTP',
            html: `
                <h3>Your Parkify Verification Code</h3>
                <p>Use the following 6-digit OTP to complete your verification.</p>
                <h2 style="color: green; letter-spacing: 2px;">${otp}</h2>
                <p>This code will expire in 5 minutes. Do not share it with anyone.</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP Sent to ${email}`);
    } catch (error) {
        console.error('Error sending OTP Email:', error);
    }
};

const sendAdminAlertEmail = async (adminEmail, newUser) => {
    try {
        const mailOptions = {
            from: `"Parkify System" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: '🔔 New User Registration Alert',
            html: `
                <h3>New User Registered on Parkify</h3>
                <p>A new user has just verified their account:</p>
                <ul>
                    <li><strong>Name:</strong> ${newUser.name}</li>
                    <li><strong>Email:</strong> ${newUser.email}</li>
                    <li><strong>Role:</strong> ${newUser.role}</li>
                </ul>
                <p>Login to the dashboard for more details.</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Admin Alert Sent to ${adminEmail}`);
    } catch (error) {
        console.error('Error sending Admin Alert Email:', error);
    }
};

module.exports = { sendOtpEmail, sendAdminAlertEmail };
