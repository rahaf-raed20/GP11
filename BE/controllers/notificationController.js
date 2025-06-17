const Notification = require('../models/Notification');

module.exports = {
  // Create a new notification
  createNotification: async (req, res) => {
    try {
      const { userId, typeId, title, message, relatedId } = req.body;
      
      // Validate input
      if (!userId || !typeId || !title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const notificationId = await Notification.create({
        userId,
        typeId,
        title,
        message,
        relatedId
      });

      res.status(201).json({
        success: true,
        data: { notificationId },
        message: 'Notification created'
      });
    } catch (error) {
      console.error('Create notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create notification'
      });
    }
  },

  // Get all notifications for current user
  getUserNotifications: async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 20, offset = 0 } = req.query;

      const notifications = await Notification.getAllByUser(
        userId, 
        parseInt(limit), 
        parseInt(offset)
      );

      const unreadCount = await Notification.getUnreadCount(userId);

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount
        }
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notifications'
      });
    }
  },

  // Mark notification as read
  markAsRead: async (req, res) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const success = await Notification.markAsRead(notificationId, userId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      const unreadCount = await Notification.getUnreadCount(userId);

      res.json({
        success: true,
        data: { unreadCount },
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read'
      });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.id;
      const count = await Notification.markAllAsRead(userId);

      res.json({
        success: true,
        data: { markedCount: count },
        message: `Marked ${count} notifications as read`
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notifications as read'
      });
    }
  }
};