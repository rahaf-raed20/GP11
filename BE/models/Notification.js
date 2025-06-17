const pool = require('../config/db');

const Notification = {
  // Create a new notification
  async create({ userId, typeId, title, message, relatedId = null }) {
    const [result] = await pool.query(
      `INSERT INTO notifications 
       (user_id, type_id, title, message, related_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, typeId, title, message, relatedId]
    );
    return result.insertId;
  },

  // Get all notifications for a user
  async getAllByUser(userId, limit = 20, offset = 0) {
    const [notifications] = await pool.query(
      `SELECT n.*, nt.name as type_name 
       FROM notifications n
       JOIN notification_types nt ON n.type_id = nt.id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return notifications;
  },

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    const [result] = await pool.query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE id = ? AND user_id = ?`,
      [notificationId, userId]
    );
    return result.affectedRows > 0;
  },

  // Mark all notifications as read
  async markAllAsRead(userId) {
    const [result] = await pool.query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE user_id = ? AND is_read = FALSE`,
      [userId]
    );
    return result.affectedRows;
  },

  // Get unread count
  async getUnreadCount(userId) {
    const [result] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM notifications 
       WHERE user_id = ? AND is_read = FALSE`,
      [userId]
    );
    return result[0].count;
  }
};

module.exports = Notification;