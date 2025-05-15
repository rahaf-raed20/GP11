const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    createCompany,
    getCompanies,
    getCompany,
    updateCompany,
    deleteCompany,
    getCompanyBookings
} = require('../controllers/thirdPartyController');
const authenticateToken = require('../middleware/authMiddleware');

// Profile routes
router.get('/profile', authenticateToken, getProfile);
router.patch('/profile', authenticateToken, updateProfile);

// Company routes
router.post('/companies', authenticateToken, createCompany);
router.get('/companies', authenticateToken, getCompanies);
router.get('/companies/:id', authenticateToken, getCompany);
router.patch('/companies/:id', authenticateToken, updateCompany);
router.delete('/companies/:id', authenticateToken, deleteCompany);

// Booking routes
router.get('/companies/:id/bookings', authenticateToken, getCompanyBookings);

module.exports = router;