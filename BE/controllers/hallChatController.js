const pool = require('../config/db');

const hallChatController = {
  // Get all chat threads for a hall owner
  getThreads: async (req, res) => {
    try {
      const hallOwnerId = req.user.id;
      
      // Get all threads where the hall owner is the provider
      const [threads] = await pool.query(`
        SELECT 
          ct.id,
          ct.customer_id,
          u.fname as customer_name,
          h.name as hall_name,
          cm.message as last_message,
          cm.sent_at as last_message_time,
          SUM(CASE WHEN cm.sender_type = 'customer' AND cm.is_read = FALSE THEN 1 ELSE 0 END) as unread_count
        FROM chat_threads ct
        JOIN halls h ON ct.recipient_id = h.id AND ct.recipient_type = 'hall'
        JOIN user u ON ct.customer_id = u.id
        LEFT JOIN chat_messages cm ON cm.id = (
          SELECT id FROM chat_messages 
          WHERE thread_id = ct.id 
          ORDER BY sent_at DESC LIMIT 1
        )
        WHERE h.owner_id = ? AND ct.provider_type = 'hall_owner'
        GROUP BY ct.id
        ORDER BY cm.sent_at DESC
      `, [hallOwnerId]);
      
      res.status(200).json({ success: true, data: threads });
    } catch (error) {
      console.error('Error getting hall threads:', error);
      res.status(500).json({ success: false, message: 'Failed to get chat threads' });
    }
  },

  // Get messages in a specific thread
  getThreadMessages: async (req, res) => {
    try {
      const hallOwnerId = req.user.id;
      const threadId = req.params.threadId;
      
      // Verify thread belongs to this hall owner
      const [thread] = await pool.query(`
        SELECT ct.id 
        FROM chat_threads ct
        JOIN halls h ON ct.recipient_id = h.id AND ct.recipient_type = 'hall'
        WHERE ct.id = ? AND h.owner_id = ? AND ct.provider_type = 'hall_owner'
      `, [threadId, hallOwnerId]);
      
      if (!thread.length) {
        return res.status(403).json({ 
          success: false, 
          message: 'Thread not found or access denied' 
        });
      }
      
      // Get messages
      const [messages] = await pool.query(`
        SELECT 
          id,
          sender_type,
          message,
          sent_at,
          is_read
        FROM chat_messages
        WHERE thread_id = ?
        ORDER BY sent_at ASC
      `, [threadId]);
      
      // Mark customer messages as read
      await pool.query(
        `UPDATE chat_messages 
        SET is_read = TRUE 
        WHERE thread_id = ? AND sender_type = 'customer' AND is_read = FALSE`,
        [threadId]
      );
      
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      console.error('Error getting hall messages:', error);
      res.status(500).json({ success: false, message: 'Failed to get messages' });
    }
  },

  // Send reply as hall owner
  sendReply: async (req, res) => {
    try {
      const hallOwnerId = req.user.id;
      const threadId = req.params.threadId;
      const { message } = req.body;
      
      // Verify thread belongs to this hall owner
      const [thread] = await pool.query(`
        SELECT ct.id 
        FROM chat_threads ct
        JOIN halls h ON ct.recipient_id = h.id AND ct.recipient_type = 'hall'
        WHERE ct.id = ? AND h.owner_id = ? AND ct.provider_type = 'hall_owner'
      `, [threadId, hallOwnerId]);
      
      if (!thread.length) {
        return res.status(403).json({ 
          success: false, 
          message: 'Thread not found or access denied' 
        });
      }
      
      // Add message
      await pool.query(
        `INSERT INTO chat_messages 
        (thread_id, sender_type, message) 
        VALUES (?, 'provider', ?)`,
        [threadId, message]
      );
      
      res.status(201).json({ success: true, message: 'Reply sent' });
    } catch (error) {
      console.error('Error sending hall reply:', error);
      res.status(500).json({ success: false, message: 'Failed to send reply' });
    }
  }
};

module.exports = hallChatController;