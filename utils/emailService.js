const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'onboarding@resend.dev';

const sendOtpEmail = async (email, otp) => {
    try {
        console.log(`Attempting to send OTP to: ${email}`);
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [email],
            subject: 'Parkify Authentication OTP',
            html: `
                <h3>Your Parkify Verification Code</h3>
                <h2 style="color: green; letter-spacing: 2px;">${otp}</h2>
                <p>This code will expire in 5 minutes. Do not share it with anyone.</p>
            `,
        });

        if (error) {
            console.error('FATAL ERROR sending OTP Email:', error);
        } else {
            console.log(`OTP Sent Successfully to ${email}. ID: ${data.id}`);
        }
    } catch (error) {
        console.error('FATAL ERROR sending OTP Email:', error);
    }
};

const sendAdminAlertEmail = async (adminEmail, newUser) => {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [adminEmail],
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
        });

        if (error) {
            console.error('Error sending Admin Alert Email:', error);
        } else {
            console.log(`Admin Alert Sent to ${adminEmail}`);
        }
    } catch (error) {
        console.error('Error sending Admin Alert Email:', error);
    }
};

module.exports = { sendOtpEmail, sendAdminAlertEmail };
