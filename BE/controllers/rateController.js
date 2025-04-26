const pool = require('../config/db');

const rateController = {
    getHallAverageRating: async (req, res) => {
        try {
            const hallId = req.params.hallId;
            const ownerId = req.user.id;

            // 1. Verify the hall belongs to the owner
            const [hall] = await pool.query(
                `SELECT h.id FROM halls h
                JOIN owner o ON h.owner_id = o.id
                WHERE h.id = ? AND o.user_id = ?`,
                [hallId, ownerId]
            );

            if (!hall.length) {
                return res.status(403).json({
                    success: false,
                    message: 'Hall not found or access denied'
                });
            }

            // 2. Calculate average rating
            const [result] = await pool.query(`
                SELECT 
                    AVG(value) as average_rating,
                    COUNT(id) as total_ratings,
                    MIN(created_at) as first_rating_date,
                    MAX(created_at) as last_rating_date
                FROM rate
                WHERE hall_id = ?
            `, [hallId]);

            // 3. Format response
            const response = {
                average_rating: result[0].average_rating ? parseFloat(result[0].average_rating).toFixed(1) : null,
                total_ratings: result[0].total_ratings,
                rating_range: {
                    min: 1,
                    max: 5
                },
                first_rating_date: result[0].first_rating_date,
                last_rating_date: result[0].last_rating_date
            };

            return res.status(200).json({
                success: true,
                data: response
            });

        } catch (error) {
            console.error('Rating error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get rating information'
            });
        }
    }
};

module.exports = rateController;