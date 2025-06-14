const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeAdmin = require('../middleware/Admin');

// Apply authentication and admin authorization to all routes
router.use(authenticateToken);

// User management routes
router.get('/users', adminController.getAllUsers);
router.get('/users/type/:type', adminController.getUsersByType);
router.get('/users/search', adminController.searchUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Impersonation route
router.post('/impersonate/:userId', adminController.impersonateUser);

module.exports = router;