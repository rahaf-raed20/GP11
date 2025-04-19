const express = require('express');
const router = express.Router();
const hallController = require('../controllers/hallController');
const authenticateToken = require('../middleware/authMiddleware');

// Protect all hall routes with owner authentication
router.use(authenticateToken);

// Get all halls for logged-in owner
router.get('/my-halls', hallController.getHallsByOwner);

// Create new hall
router.post('/', hallController.createHall);

module.exports = router;