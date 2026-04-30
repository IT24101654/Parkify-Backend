const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
const parkingLocationRoutes = require('./routes/parkingLocationRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const path = require('path');
const fs = require('fs');
const { seedSuperAdmin } = require('./utils/seeder');
const { startReservationScheduler } = require('./utils/reservationScheduler');

// Seed Super Admin on Startup
seedSuperAdmin();

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/parking-locations', parkingLocationRoutes);
app.use('/api/reservations', reservationRoutes);

// Start background scheduler for auto reservation status progression
startReservationScheduler();

const uploadDir = path.join(__dirname, 'uploads/vehicle-docs');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
