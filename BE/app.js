require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const cityRoutes = require('./routes/cityRoutes');
const hallRoutes = require('./routes/hallRoutes');
const profileRoutes = require('./routes/profileRoutes');
const vacationRoutes = require('./routes/vacationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const rateRoutes = require('./routes/rateRoutes');
const errorHandler = require('./middleware/errorHandler');
const thirdPartyRoutes = require('./routes/thirdPartyRoutes');
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/third-party', thirdPartyRoutes);

// Routes - Make sure authRoutes is properly required
app.use('/api/auth', authRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/vacations', vacationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rates', rateRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Service is running' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});