const express = require('express');
const thirdPartyChatController = require('../controllers/thirdPartyChatController');
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

// Third Party Chat Routes
router.get('/chats', thirdPartyChatController.getThreads);
router.get('/chats/:threadId', thirdPartyChatController.getThreadMessages);
router.post('/chats/:threadId/reply', thirdPartyChatController.sendReply);
// Booking routes
router.get('/companies/:id/bookings', authenticateToken, getCompanyBookings);

module.exports = router;