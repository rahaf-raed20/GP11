const pool = require('../config/db');

const chatController = {
 startChatThread: async (req, res) => {
    try {
      const customerId = req.user.id;
      const { recipientType, recipientId, initialMessage } = req.body;
      
      // Validate recipient type
      if (!['hall', 'third_party'].includes(recipientType)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid recipient type' 
        });
      }
      
      // Check if thread already exists
      const [existingThread] = await pool.query(
        `SELECT id FROM chat_threads 
        WHERE customer_id = ? AND recipient_type = ? AND recipient_id = ?`,
        [customerId, recipientType, recipientId]
      );
      
      if (existingThread.length > 0) {
        return res.status(200).json({ 
          success: true, 
          data: { threadId: existingThread[0].id },
          message: 'Using existing thread'
        });
      }

      // Determine provider information based on recipient type
      let providerId, providerType;
      
      if (recipientType === 'hall') {
        // Get hall owner info
        const [hall] = await pool.query(
          `SELECT owner_id FROM halls WHERE id = ?`,
          [recipientId]
        );
        
        if (!hall.length) {
          return res.status(404).json({
            success: false,
            message: 'Hall not found'
          });
        }
        
        // Get user_id from owner table
        const [owner] = await pool.query(
          `SELECT id FROM owner WHERE id = ?`,
          [hall[0].owner_id]
        );
        
        if (!owner.length) {
          return res.status(404).json({
            success: false,
            message: 'Hall owner not found'
          });
        }
        
        providerId = owner[0].id;
        providerType = 'hall_owner';
      } 
      else if (recipientType === 'third_party') {
        // Get third party company info
        const [company] = await pool.query(
          `SELECT third_party_id FROM third_party_company WHERE id = ?`,
          [recipientId]
        );
        
        if (!company.length) {
          return res.status(404).json({
            success: false,
            message: 'Third party company not found'
          });
        }
        
        // Get user_id from third_party table
        const [thirdParty] = await pool.query(
          `SELECT id FROM third_party WHERE id = ?`,
          [company[0].third_party_id]
        );
        
        if (!thirdParty.length) {
          return res.status(404).json({
            success: false,
            message: 'Third party provider not found'
          });
        }
        
        providerId = thirdParty[0].id;
        providerType = 'third_party';
      }
      
      // Create new thread with provider information
      const [threadResult] = await pool.query(
        `INSERT INTO chat_threads 
        (customer_id, recipient_type, recipient_id, provider_id, provider_type) 
        VALUES (?, ?, ?, ?, ?)`,
        [customerId, recipientType, recipientId, providerId, providerType]
      );
      
      // Add initial message
      await pool.query(
        `INSERT INTO chat_messages 
        (thread_id, sender_type, message) 
        VALUES (?, 'customer', ?)`,
        [threadResult.insertId, initialMessage]
      );
      
      res.status(201).json({ 
        success: true, 
        data: { 
          threadId: threadResult.insertId,
          providerId,
          providerType 
        } 
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to start chat',
        error: error.message 
      });
    }
  },

  sendMessage: async (req, res) => {
    try {
      const customerId = req.user.id;
      const threadId = req.params.threadId;
      const { message } = req.body;
      
      // Verify thread ownership
      const [thread] = await pool.query(
        'SELECT id FROM chat_threads WHERE id = ? AND customer_id = ?',
        [threadId, customerId]
      );
      
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
        VALUES (?, 'customer', ?)`,
        [threadId, message]
      );
      
      res.status(201).json({ success: true, message: 'Message sent' });
    } catch (error) {
      console.error('Message error:', error);
      res.status(500).json({ success: false, message: 'Failed to send message' });
    }
  },

  getChatThreads: async (req, res) => {
    try {
      const customerId = req.user.id;
      
      const [threads] = await pool.query(`
        SELECT 
          ct.id,
          ct.recipient_type,
          ct.recipient_id,
          CASE 
            WHEN ct.recipient_type = 'hall' THEN h.name
            WHEN ct.recipient_type = 'third_party' THEN tpc.name
          END as recipient_name,
          cm.message as last_message,
          cm.sent_at as last_message_time
        FROM chat_threads ct
        LEFT JOIN chat_messages cm ON cm.id = (
          SELECT id FROM chat_messages 
          WHERE thread_id = ct.id 
          ORDER BY sent_at DESC LIMIT 1
        )
        LEFT JOIN halls h ON ct.recipient_type = 'hall' AND h.id = ct.recipient_id
        LEFT JOIN third_party_company tpc ON ct.recipient_type = 'third_party' AND tpc.id = ct.recipient_id
        WHERE ct.customer_id = ?
        ORDER BY cm.sent_at DESC
      `, [customerId]);
      
      res.status(200).json({ success: true, data: threads });
    } catch (error) {
      console.error('Thread error:', error);
      res.status(500).json({ success: false, message: 'Failed to get threads' });
    }
  },

  getThreadMessages: async (req, res) => {
    try {
      const customerId = req.user.id;
      const threadId = req.params.threadId;
      
      // Verify thread ownership
      const [thread] = await pool.query(
        'SELECT id FROM chat_threads WHERE id = ? AND customer_id = ?',
        [threadId, customerId]
      );
      
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
          read_at
        FROM chat_messages
        WHERE thread_id = ?
        ORDER BY sent_at ASC
      `, [threadId]);
      
      // Mark messages as read
      await pool.query(
        `UPDATE chat_messages 
        SET read_at = NOW() 
        WHERE thread_id = ? AND sender_type = 'provider' AND read_at IS NULL`,
        [threadId]
      );
      
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      console.error('Messages error:', error);
      res.status(500).json({ success: false, message: 'Failed to get messages' });
    }
  }
};

module.exports = chatController;