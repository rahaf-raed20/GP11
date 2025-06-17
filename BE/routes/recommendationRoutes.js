const express = require('express');
const router = express.Router();
const { 
  getLocalRecommendations,
  getCityRecommendations,
  getSimilarHalls 
} = require('../controllers/AIRecommendationController');
const authenticateToken = require('../middleware/authMiddleware');

// Local recommendations (user's city)
router.get('/local', authenticateToken, getLocalRecommendations);

// Recommendations for any city
router.get('/city', authenticateToken, getCityRecommendations);

// Similar halls recommendations
router.get('/similar', authenticateToken, getSimilarHalls);

module.exports = router;