const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authenticateToken = require('../middleware/authMiddleware');

// Protect all profile routes
router.use(authenticateToken);

// Get my profile
router.get('/', profileController.getMyProfile);

// Update my profile
router.patch('/', profileController.updateMyProfile);

module.exports = router;