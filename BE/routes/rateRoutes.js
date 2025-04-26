const express = require('express');
const router = express.Router();
const rateController = require('../controllers/rateController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/hall/:hallId/average', 
    authenticateToken,
    rateController.getHallAverageRating
);

module.exports = router;