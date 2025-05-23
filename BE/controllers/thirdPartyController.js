const pool = require('../config/db');

// 1. Show my profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const [profile] = await pool.query(`
            SELECT 
                u.id, u.fname, u.mname, u.lname, u.email, 
                u.image_url, u.city_id, c.name as city_name,
                COUNT(tpc.id) as total_companies
            FROM user u
            JOIN city c ON u.city_id = c.id
            LEFT JOIN third_party tp ON tp.user_id = u.id
            LEFT JOIN third_party_company tpc ON tpc.third_party_id = tp.id
            WHERE u.id = ?
            GROUP BY u.id
        `, [userId]);

        res.status(200).json({ success: true, data: profile[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to get profile' });
    }
};

// 2. Update profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fname, lname, image_url, city_id } = req.body;
        
        await pool.query(
            `UPDATE user 
            SET fname = ?, lname = ?, image_url = ?, city_id = ?
            WHERE id = ?`,
            [fname, lname, image_url, city_id, userId]
        );
        
        res.status(200).json({ success: true, message: 'Profile updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Update failed' });
    }
};

// 3. Create new company
const createCompany = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, category_id, city_id, price_per_party, image_url } = req.body;
        
        // Get third_party_id
        const [tp] = await pool.query(
            'SELECT id FROM third_party WHERE user_id = ?', 
            [userId]
        );
        
        const [result] = await pool.query(
            `INSERT INTO third_party_company 
            (name, category_id, city_id, third_party_id, price_per_party, image_url)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [name, category_id, city_id, tp[0].id, price_per_party, image_url]
        );
        
        res.status(201).json({ 
            success: true, 
            data: { companyId: result.insertId } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Creation failed' });
    }
};

// 4. Get all companies
const getCompanies = async (req, res) => {
    try {
        const userId = req.user.id;
        const [companies] = await pool.query(`
            SELECT 
                tpc.id, tpc.name, tpc.price_per_party, tpc.image_url,
                tc.type as category, c.name as city,
                COUNT(cb.id) as total_bookings
            FROM third_party_company tpc
            JOIN third_party tp ON tpc.third_party_id = tp.id
            JOIN third_category tc ON tpc.category_id = tc.id
            JOIN city c ON tpc.city_id = c.id
            LEFT JOIN company_booking cb ON cb.company_id = tpc.id
            WHERE tp.user_id = ?
            GROUP BY tpc.id
        `, [userId]);
        
        res.status(200).json({ success: true, data: companies });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to get companies' });
    }
};

// 5. Get single company
const getCompany = async (req, res) => {
    try {
        const userId = req.user.id;
        const companyId = req.params.id;
        
        const [company] = await pool.query(`
            SELECT 
                tpc.*, 
                tc.type as category_name,
                c.name as city_name
            FROM third_party_company tpc
            JOIN third_party tp ON tpc.third_party_id = tp.id
            JOIN third_category tc ON tpc.category_id = tc.id
            JOIN city c ON tpc.city_id = c.id
            WHERE tpc.id = ? AND tp.user_id = ?
        `, [companyId, userId]);
        
        if (!company.length) {
            return res.status(404).json({ 
                success: false, 
                message: 'Company not found' 
            });
        }
        
        res.status(200).json({ success: true, data: company[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to get company' });
    }
};

// 6. Update company
const updateCompany = async (req, res) => {
    try {
        const userId = req.user.id;
        const companyId = req.params.id;
        const updates = req.body;
        
        // Verify ownership first
        const [company] = await pool.query(`
            SELECT tpc.id FROM third_party_company tpc
            JOIN third_party tp ON tpc.third_party_id = tp.id
            WHERE tpc.id = ? AND tp.user_id = ?
        `, [companyId, userId]);
        
        if (!company.length) {
            return res.status(403).json({ 
                success: false, 
                message: 'Company not found or access denied' 
            });
        }

        // 1. Get current values from database
        const [currentData] = await pool.query(
            'SELECT * FROM third_party_company WHERE id = ?',
            [companyId]
        );
        
        if (!currentData.length) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // 2. Prepare update fields - merge existing with updates
        const updatedFields = {
            ...currentData[0],
            ...updates,
            updated_at: new Date()  // Always update the timestamp
        };

        // 3. Execute update with only changed fields
        const query = `
            UPDATE third_party_company
            SET 
                name = ?,
                category_id = ?,
                city_id = ?,
                price_per_party = ?,
                image_url = ?,
                updated_at = ?
            WHERE id = ?
        `;
        
        const params = [
            updatedFields.name,
            updatedFields.category_id,
            updatedFields.city_id,
            updatedFields.price_per_party,
            updatedFields.image_url,
            updatedFields.updated_at,
            companyId
        ];

        await pool.query(query, params);
        
        res.status(200).json({ 
            success: true, 
            message: 'Company updated successfully',
            updatedFields: Object.keys(updates) // Return which fields were updated
        });
        
    } catch (error) {
        console.error('Update company error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update company',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// 7. Delete company
const deleteCompany = async (req, res) => {
    try {
        const userId = req.user.id;
        const companyId = req.params.id;
        
        // Verify ownership
        const [company] = await pool.query(`
            SELECT tpc.id FROM third_party_company tpc
            JOIN third_party tp ON tpc.third_party_id = tp.id
            WHERE tpc.id = ? AND tp.user_id = ?
        `, [companyId, userId]);
        
        if (!company.length) {
            return res.status(403).json({ 
                success: false, 
                message: 'Company not found or access denied' 
            });
        }
        
        await pool.query('DELETE FROM third_party_company WHERE id = ?', [companyId]);
        
        res.status(200).json({ success: true, message: 'Company deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Deletion failed' });
    }
};

// 8. Get company bookings
const getCompanyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const companyId = req.params.id;
        
        // Verify ownership
        const [company] = await pool.query(`
            SELECT tpc.id FROM third_party_company tpc
            JOIN third_party tp ON tpc.third_party_id = tp.id
            WHERE tpc.id = ? AND tp.user_id = ?
        `, [companyId, userId]);
        
        if (!company.length) {
            return res.status(403).json({ 
                success: false, 
                message: 'Company not found or access denied' 
            });
        }
        
        const [bookings] = await pool.query(`
            SELECT 
                cb.id, cb.start_time, cb.end_time, cb.price,
                b.event_date,
                CONCAT(u.fname, ' ', u.lname) as customer_name,
                h.name as hall_name
            FROM company_booking cb
            JOIN booking b ON cb.booking_id = b.id
            JOIN halls h ON b.halls_id = h.id
            JOIN customer c ON b.customer_id = c.id
            JOIN user u ON c.user_id = u.id
            WHERE cb.company_id = ?
            ORDER BY b.event_date DESC
        `, [companyId]);
        
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to get bookings' });
    }
};
const getThirdPartyDetails = async (req, res) => {
        try {
            const companyId = req.params.id;
            
            // Get basic company info
            const [company] = await pool.query(`
                SELECT 
                    tpc.*,
                    tc.type as category_name,
                    c.name as city_name
                FROM third_party_company tpc
                JOIN third_category tc ON tpc.category_id = tc.id
                JOIN city c ON tpc.city_id = c.id
                WHERE tpc.id = ?
            `, [companyId]);

            if (!company.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Service provider not found'
                });
            }
           

            // Get upcoming bookings (for availability reference)
            const [bookings] = await pool.query(`
                SELECT cb.start_time, cb.end_time, cb.price,
                       b.event_date,
                       h.name as hall_name
                FROM company_booking cb
                JOIN booking b ON cb.booking_id = b.id
                JOIN halls h ON b.halls_id = h.id
                WHERE cb.company_id = ?
                AND b.event_date >= CURDATE()
                ORDER BY b.event_date ASC
                LIMIT 5
            `, [companyId]);

            res.status(200).json({
                success: true,
                data: {
                    ...company[0],
                    upcoming_bookings: bookings
                }
            });

        } catch (error) {
            console.error('Error fetching third party details:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve service provider details'
            });
        }
};

 // Get all chat threads for a third party company
const  getThreads = async (req, res) => {
    try {
         const userId = req.user.id;
         
        const [thirdPartyid] = await pool.query(
        'SELECT id FROM third_party WHERE user_id = ?',
        [userId]
    );
            
    if (!thirdPartyid.length) {
        return res.status(403).json({
            success: false,
            message: 'Third_party account not found'
        });
    }
    const thirdPartyId = thirdPartyid[0].id;
      // Get all threads where the third party is the provider
      const [threads] = await pool.query(`
        SELECT 
          ct.id,
          ct.customer_id,
          u.fname as customer_name,
          tpc.name as company_name,
          cm.message as last_message,
          cm.sent_at as last_message_time,
          SUM(CASE WHEN cm.sender_type = 'customer' AND cm.is_read = FALSE THEN 1 ELSE 0 END) as unread_count
        FROM chat_threads ct
        JOIN third_party_company tpc ON ct.recipient_id = tpc.id AND ct.recipient_type = 'third_party'
        JOIN user u ON ct.customer_id = u.id
        LEFT JOIN chat_messages cm ON cm.id = (
          SELECT id FROM chat_messages 
          WHERE thread_id = ct.id 
          ORDER BY sent_at DESC LIMIT 1
        )
        WHERE tpc.third_party_id = ? AND ct.provider_type = 'third_party'
        GROUP BY ct.id
        ORDER BY cm.sent_at DESC
      `, [thirdPartyId]);
      res.status(200).json({ success: true, data: threads });
    } catch (error) {
      console.error('Error getting third party threads:', error);
      res.status(500).json({ success: false, message: 'Failed to get chat threads' });
    }
};

  // Get messages in a specific thread
const getThreadMessages =  async (req, res) => {
    try {
      const threadId = req.params.threadId;
      const userId = req.user.id;
        const [thirdPartyid] = await pool.query(
        'SELECT id FROM third_party WHERE user_id = ?',
        [userId]
    );
            
    if (!thirdPartyid.length) {
        return res.status(403).json({
            success: false,
            message: 'Owner account not found'
        });
    }
    const thirdPartyId = thirdPartyid[0].id;
      // Verify thread belongs to this third party
      const [thread] = await pool.query(`
        SELECT ct.id 
        FROM chat_threads ct
        JOIN third_party_company tpc ON ct.recipient_id = tpc.id AND ct.recipient_type = 'third_party'
        WHERE ct.id = ? AND tpc.third_party_id = ? AND ct.provider_type = 'third_party'
      `, [threadId, thirdPartyId]);
      
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
      console.error('Error getting third party messages:', error);
      res.status(500).json({ success: false, message: 'Failed to get messages' });
    }
};

  // Send reply as third party
const sendReply = async (req, res) => {
    try {
      const threadId = req.params.threadId;
      const { message } = req.body;
      const userId = req.user.id;
        const [thirdPartyid] = await pool.query(
        'SELECT id FROM third_party WHERE user_id = ?',
        [userId]
    );
            
    if (!thirdPartyid.length) {
        return res.status(403).json({
            success: false,
            message: 'Owner account not found'
        });
    }
    const thirdPartyId = thirdPartyid[0].id;
      // Verify thread belongs to this third party
      const [thread] = await pool.query(`
        SELECT ct.id 
        FROM chat_threads ct
        JOIN third_party_company tpc ON ct.recipient_id = tpc.id AND ct.recipient_type = 'third_party'
        WHERE ct.id = ? AND tpc.third_party_id = ? AND ct.provider_type = 'third_party'
      `, [threadId, thirdPartyId]);
      
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
      console.error('Error sending third party reply:', error);
      res.status(500).json({ success: false, message: 'Failed to send reply' });
    }
};
module.exports = {
    getProfile,
    updateProfile,
    createCompany,
    getCompanies,
    getCompany,
    updateCompany,
    deleteCompany,
    getCompanyBookings,
    getThirdPartyDetails,
    getThreads,
    getThreadMessages,
    sendReply
};