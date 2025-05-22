const pool = require('../config/db');

const hallController = {
    // Get all halls by owner
    getHallsByOwner: async (req, res) => {
        try {
            const userId = req.user.id;
            
            // First get owner record
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
            
            // Get halls with proper day mapping
            const [halls] = await pool.query(`
                SELECT 
                    h.*, 
                    c.name as city_name,
                    CASE 
                        WHEN h.open_day = 1 THEN 'Saturday'
                        WHEN h.open_day = 2 THEN 'Sunday'
                        WHEN h.open_day = 3 THEN 'Monday'
                        WHEN h.open_day = 4 THEN 'Tuesday'
                        WHEN h.open_day = 5 THEN 'Wednesday'
                        WHEN h.open_day = 6 THEN 'Thursday'
                        WHEN h.open_day = 7 THEN 'Friday'
                    END as open_day_name,
                    CASE 
                        WHEN h.close_day = 1 THEN 'Saturday'
                        WHEN h.close_day = 2 THEN 'Sunday'
                        WHEN h.close_day = 3 THEN 'Monday'
                        WHEN h.close_day = 4 THEN 'Tuesday'
                        WHEN h.close_day = 5 THEN 'Wednesday'
                        WHEN h.close_day = 6 THEN 'Thursday'
                        WHEN h.close_day = 7 THEN 'Friday'
                        ELSE 'Always Open'
                    END as close_day_name
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

    // Create new hall with image handling
    createHall: async (req, res) => {
        try {
            const userId = req.user.id;
            const { 
                name,
                open_day,
                close_day,
                open_time,
                close_time,
                price_per_hour,
                city_id,
                capacity,
                image_url
            } = req.body;

            // Validate required fields
            if (!name || !price_per_hour || !city_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, price, and city are required'
                });
            }

            // Validate day numbers (1-7)
            if (open_day && (open_day < 1 || open_day > 7)) {
                return res.status(400).json({
                    success: false,
                    message: 'Open day must be between 1 (Saturday) and 7 (Friday)'
                });
            }

            if (close_day && (close_day < 1 || close_day > 7)) {
                return res.status(400).json({
                    success: false,
                    message: 'Close day must be between 1 (Saturday) and 7 (Friday)'
                });
            }

            // Get owner record
            const [owner] = await pool.query(
                'SELECT id FROM owner WHERE user_id = ?', 
                [userId]
            );
            
            if (!owner.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Owner registration required'
                });
            }

            // Insert new hall
            const [result] = await pool.query(`
                INSERT INTO halls (
                    name,
                    open_day,
                    close_day,
                    open_time,
                    close_time,
                    price_per_hour,
                    owner_id,
                    city_id,
                    capacity,
                    image_url,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                name,
                open_day || null,
                close_day || null,
                open_time || null,
                close_time || null,
                price_per_hour,
                owner[0].id,
                city_id,
                capacity || null,
                image_url || null
            ]);

            // Return the created hall with day names
            const [newHall] = await pool.query(`
                SELECT 
                    h.*,
                    c.name as city_name,
                    CASE 
                        WHEN h.open_day = 1 THEN 'Saturday'
                        WHEN h.open_day = 2 THEN 'Sunday'
                        WHEN h.open_day = 3 THEN 'Monday'
                        WHEN h.open_day = 4 THEN 'Tuesday'
                        WHEN h.open_day = 5 THEN 'Wednesday'
                        WHEN h.open_day = 6 THEN 'Thursday'
                        WHEN h.open_day = 7 THEN 'Friday'
                    END as open_day_name,
                    CASE 
                        WHEN h.close_day = 1 THEN 'Saturday'
                        WHEN h.close_day = 2 THEN 'Sunday'
                        WHEN h.close_day = 3 THEN 'Monday'
                        WHEN h.close_day = 4 THEN 'Tuesday'
                        WHEN h.close_day = 5 THEN 'Wednesday'
                        WHEN h.close_day = 6 THEN 'Thursday'
                        WHEN h.close_day = 7 THEN 'Friday'
                        ELSE 'Always Open'
                    END as close_day_name
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
    },

    
    // Get single hall by ID (owner must own this hall)
    getHallById: async (req, res) => {
            try {
                const userId = req.user.id;
                const hallId = req.params.id;
    
                // Verify owner and get owner_id
                const [owner] = await pool.query(
                    'SELECT id FROM owner WHERE user_id = ?', 
                    [userId]
                );
                
                if (!owner.length) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied. Owner record not found'
                    });
                }
    
                // Get hall with full details
                const [hall] = await pool.query(`
                    SELECT 
                        h.*, 
                        c.name as city_name,
                        CASE 
                            WHEN h.open_day = 1 THEN 'Saturday'
                            WHEN h.open_day = 2 THEN 'Sunday'
                            WHEN h.open_day = 3 THEN 'Monday'
                            WHEN h.open_day = 4 THEN 'Tuesday'
                            WHEN h.open_day = 5 THEN 'Wednesday'
                            WHEN h.open_day = 6 THEN 'Thursday'
                            WHEN h.open_day = 7 THEN 'Friday'
                        END as open_day_name,
                        CASE 
                            WHEN h.close_day = 1 THEN 'Saturday'
                            WHEN h.close_day = 2 THEN 'Sunday'
                            WHEN h.close_day = 3 THEN 'Monday'
                            WHEN h.close_day = 4 THEN 'Tuesday'
                            WHEN h.close_day = 5 THEN 'Wednesday'
                            WHEN h.close_day = 6 THEN 'Thursday'
                            WHEN h.close_day = 7 THEN 'Friday'
                            ELSE 'Always Open'
                        END as close_day_name
                    FROM halls h
                    JOIN city c ON h.city_id = c.id
                    WHERE h.id = ? AND h.owner_id = ?
                `, [hallId, owner[0].id]);
    
                if (!hall.length) {
                    return res.status(404).json({
                        success: false,
                        message: 'Hall not found or access denied'
                    });
                }
    
                return res.status(200).json({
                    success: true,
                    data: hall[0],
                    message: 'Hall retrieved successfully'
                });
    
            } catch (error) {
                console.error('Error fetching hall:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to retrieve hall'
                });
            }
        },
    
    // Update hall
    updateHall: async (req, res) => {
            try {
                const userId = req.user.id;
                const hallId = req.params.id;
                const updates = req.body;
    
                // Verify owner and get owner_id
                const [owner] = await pool.query(
                    'SELECT id FROM owner WHERE user_id = ?', 
                    [userId]
                );
                
                if (!owner.length) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied. Owner record not found'
                    });
                }
    
                // Prepare update fields
                const validFields = [
                    'name', 'open_day', 'close_day', 'open_time', 
                    'close_time', 'price_per_hour', 'city_id', 
                    'capacity', 'image_url'
                ];
                
                const updateFields = {};
                const updateValues = [];
    
                // Validate and prepare updates
                for (const [key, value] of Object.entries(updates)) {
                    if (validFields.includes(key) && value !== undefined) {
                        // Special validation for days
                        if ((key === 'open_day' || key === 'close_day') && value !== null) {
                            if (value < 1 || value > 7) {
                                return res.status(400).json({
                                    success: false,
                                    message: `${key} must be between 1-7 or null`
                                });
                            }
                        }
                        updateFields[key] = value;
                        updateValues.push(`${key} = ?`);
                    }
                }
    
                if (updateValues.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'No valid fields to update'
                    });
                }
    
                // Execute update
                const query = `
                    UPDATE halls 
                    SET ${updateValues.join(', ')}, updated_at = NOW()
                    WHERE id = ? AND owner_id = ?
                `;
                
                const params = [...Object.values(updateFields), hallId, owner[0].id];
                
                const [result] = await pool.query(query, params);
    
                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Hall not found or access denied'
                    });
                }
    
                // Return updated hall
                const [updatedHall] = await pool.query(`
                    SELECT h.*, c.name as city_name 
                    FROM halls h
                    JOIN city c ON h.city_id = c.id
                    WHERE h.id = ?
                `, [hallId]);
    
                return res.status(200).json({
                    success: true,
                    data: updatedHall[0],
                    message: 'Hall updated successfully'
                });
    
            } catch (error) {
                console.error('Error updating hall:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update hall'
                });
            }
        },
    
    // Delete hall
    deleteHall: async (req, res) => {
            try {
                const userId = req.user.id;
                const hallId = req.params.id;
    
                // Verify owner and get owner_id
                const [owner] = await pool.query(
                    'SELECT id FROM owner WHERE user_id = ?', 
                    [userId]
                );
                
                if (!owner.length) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied. Owner record not found'
                    });
                }
    
                // Check for existing bookings
                const [bookings] = await pool.query(
                    'SELECT id FROM booking WHERE halls_id = ?',
                    [hallId]
                );
                
                if (bookings.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot delete hall with existing bookings'
                    });
                }
    
                // Delete hall
                const [result] = await pool.query(
                    'DELETE FROM halls WHERE id = ? AND owner_id = ?',
                    [hallId, owner[0].id]
                );
    
                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Hall not found or access denied'
                    });
                }
    
                return res.status(200).json({
                    success: true,
                    message: 'Hall deleted successfully'
                });
    
            } catch (error) {
                console.error('Error deleting hall:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to delete hall'
                });
            }
        },

    getHallDetails: async (req, res) => {
        try {
            const hallId = req.params.id;
            
            // Get basic hall info
            const [hall] = await pool.query(`
                SELECT 
                    h.*, 
                    c.name as city_name,
                    (SELECT AVG(value) FROM rate WHERE hall_id = h.id) as avg_rating,
                    (SELECT COUNT(*) FROM rate WHERE hall_id = h.id) as total_ratings
                FROM halls h
                JOIN city c ON h.city_id = c.id
                WHERE h.id = ?
            `, [hallId]);

            if (!hall.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Hall not found'
                });
            }

            // Get hall features
            const [features] = await pool.query(`
                SELECT hf.name 
                FROM hall_feature_mappings hfm
                JOIN hall_features hf ON hfm.feature_id = hf.id
                WHERE hfm.hall_id = ?
            `, [hallId]);

            // Get upcoming bookings (for availability reference)
            const [bookings] = await pool.query(`
                SELECT event_date, event_start_time, event_end_time
                FROM booking
                WHERE halls_id = ? 
                AND event_date >= CURDATE()
                AND approval = 'approved'
                ORDER BY event_date ASC
                LIMIT 5
            `, [hallId]);

            // Get vacation days
            const [vacations] = await pool.query(`
                SELECT date 
                FROM vacation_days
                WHERE Halls_id = ?
                AND date >= CURDATE()
                ORDER BY date ASC
            `, [hallId]);

            // Get reviews
            const [reviews] = await pool.query(`
                SELECT r.value, r.feedback, r.created_at,
                       CONCAT(u.fname, ' ', u.lname) as customer_name
                FROM rate r
                JOIN customer c ON r.customer_id = c.id
                JOIN user u ON c.user_id = u.id
                WHERE r.hall_id = ?
                ORDER BY r.created_at DESC
                LIMIT 5
            `, [hallId]);

            res.status(200).json({
                success: true,
                data: {
                    ...hall[0],
                    features: features.map(f => f.name),
                    upcoming_bookings: bookings,
                    vacation_days: vacations.map(v => v.date),
                    recent_reviews: reviews
                }
            });

        } catch (error) {
            console.error('Error fetching hall details:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve hall details'
            });
        }
    }
};

module.exports = hallController;