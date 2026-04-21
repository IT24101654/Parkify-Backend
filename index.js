// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware (මේකෙන් තමයි JSON data, frontend එකෙන් backend එකට එද්දි කියවන්නේ)
app.use(cors());
app.use(express.json());

// Basic Route එකක් දාමු server එක වැඩද බලන්න
app.get('/', (req, res) => {
    res.send('Parkify API is running!');
});

// Import Routes (මෙතන තමයි අපි ඉස්සරහට routes දාන්නේ)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
