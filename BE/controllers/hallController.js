const pool = require('../config/db');

const hallController = {
    getHallsByOwner: async (req, res) => {
        try {
            const userId = req.user.id; // This is the user_id from JWT
            
            // First get the owner record for this user
            const [owner] = await pool.query(
                'SELECT id FROM owner WHERE user_id = ?', 
                [userId]
            );
            
            if (!owner.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Owner record not found'
                });
            }
            
            // Now get halls using the owner.id (not user.id)
            const [halls] = await pool.query(`
                SELECT h.*, c.name as city_name 
                FROM halls h
                JOIN city c ON h.city_id = c.id
                WHERE h.owner_id = ?
            `, [owner[0].id]);
            
            return res.status(200).json({
                success: true,
                data: halls,
                message: 'Halls retrieved successfully'
            });
            
        } catch (error) {
            console.error('Error fetching halls:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve halls'
            });
        }
    },

    createHall: async (req, res) => {
        try {
            const userId = req.user.id; // This is the user_id from JWT
            const { 
                name, 
                open_day, 
                close_date, 
                open_time, 
                close_time, 
                price_per_hour, 
                city_id, 
                capacity 
            } = req.body;

            // First get the owner record for this user
            const [owner] = await pool.query(
                'SELECT id FROM owner WHERE user_id = ?', 
                [userId]
            );
            
            if (!owner.length) {
                return res.status(400).json({
                    success: false,
                    message: 'You must register as an owner first'
                });
            }

            // Now create the hall with owner.id (not user.id)
            const [result] = await pool.query(`
                INSERT INTO halls (
                    name, open_day, close_date, open_time, 
                    close_time, price_per_hour, owner_id, 
                    city_id, capacity, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                name, 
                open_day || null, 
                close_date || null, 
                open_time || null, 
                close_time || null, 
                price_per_hour, 
                owner[0].id, // Use the owner.id from the query
                city_id, 
                capacity || null
            ]);

            // Return the newly created hall
            const [newHall] = await pool.query(`
                SELECT h.*, c.name as city_name 
                FROM halls h
                JOIN city c ON h.city_id = c.id
                WHERE h.id = ?
            `, [result.insertId]);

            return res.status(201).json({
                success: true,
                data: newHall[0],
                message: 'Hall created successfully'
            });

        } catch (error) {
            console.error('Error creating hall:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create hall'
            });
        }
    }
};

module.exports = hallController;