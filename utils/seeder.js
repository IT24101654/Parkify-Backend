// utils/seeder.js
const User = require('../models/User');

const seedSuperAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.log('Seeder: ADMIN_EMAIL or ADMIN_PASSWORD missing in environment variables.');
            return;
        }

        const adminExists = await User.findOne({ email: adminEmail, role: 'SUPER_ADMIN' });

        if (!adminExists) {
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'SUPER_ADMIN'
            });
            console.log('--- Super Admin Created Successfully ---');
            console.log(`Email: ${adminEmail}`);
        } else {
            // Optional: Update admin details if needed or just skip
            // console.log('Seeder: Super Admin already exists.');
        }
    } catch (error) {
        console.error('Seeder Error:', error.message);
    }
};

module.exports = { seedSuperAdmin };
