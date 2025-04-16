const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');

// Get all cities
router.get('/', cityController.getAllCities);

// Get single city by ID
router.get('/:id', cityController.getCityById);

module.exports = router;