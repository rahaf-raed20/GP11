const express = require('express');
const router = express.Router();
const hallController = require('../controllers/hallController');
const authenticateToken = require('../middleware/authMiddleware');

// Protect all hall routes with owner authentication
router.use(authenticateToken);


router.get('/my-halls', hallController.getHallsByOwner);// Get all halls for logged-in owner
router.post('/', hallController.createHall);            // Create new hall
router.get('/:id', hallController.getHallById);         // Get single hall
router.patch('/:id', hallController.updateHall);        // Update hall
router.delete('/:id', hallController.deleteHall);       // Delete hall

module.exports = router;