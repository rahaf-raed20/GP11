const express = require('express');
const router = express.Router();
const rateController = require('../controllers/rateController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/hall/:hallId/average',  authenticateToken,rateController.getHallAverageRating);
router.get('/halls/:hallId',  authenticateToken,rateController.getMyRating);
router.post('/halls',  authenticateToken,rateController.rateHall);

module.exports = router;