const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(cors({
    origin: true, // Reflects the request origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));


const stripeWebhookController = require('./controllers/stripeWebhookController');
app.post('/api/webhook', express.raw({type: 'application/json'}), stripeWebhookController.handleWebhook);

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Debugging: Log incoming requests to see body
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send('Parkify API is running!');
});

const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const adminRoutes = require('./routes/adminRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const slotRoutes = require('./routes/slotRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const serviceCenterRoutes = require('./routes/serviceCenterRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const serviceAppointmentRoutes = require('./routes/serviceAppointmentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const path = require('path');
const fs = require('fs');
const { seedSuperAdmin } = require('./utils/seeder');

// Seed Super Admin on Startup
seedSuperAdmin();

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/service-centers', serviceCenterRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/service-appointments', serviceAppointmentRoutes);
app.use('/api/payments', paymentRoutes);

const uploadDir = path.join(__dirname, 'uploads/vehicle-docs');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const parkingUploadDir = path.join(__dirname, 'uploads/parking-photos');
if (!fs.existsSync(parkingUploadDir)) {
    fs.mkdirSync(parkingUploadDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
