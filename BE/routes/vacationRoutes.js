const express = require('express');
const router = express.Router();
const vacationController = require('../controllers/vacationController');
const authenticateToken = require('../middleware/authMiddleware');

// Protect all routes
router.use(authenticateToken);

// Vacation routes
router.post('/', vacationController.addVacation);                 // Add vacation
router.put('/:id', vacationController.updateVacation);            // Update vacation
router.get('/hall/:hall_id', vacationController.getHallVacations); // Get all vacations for hall
router.delete('/:id', vacationController.deleteVacation);         // Delete vacation

module.exports = router;