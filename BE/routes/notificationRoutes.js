const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authenticateToken  = require('../middleware/authMiddleware');

// Apply authentication to all notification routes
router.use(authenticateToken);

// Create notification (typically called by other services)
router.post('/', notificationController.createNotification);

// Get user notifications
router.get('/', notificationController.getUserNotifications);

// Mark single notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;