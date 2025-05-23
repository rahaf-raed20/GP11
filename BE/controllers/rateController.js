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
  },
  rateHall: async (req, res) => {
    try {
      
        const { hallId, value, feedback } = req.body;
        const userId = req.user.id;
        const [customerid] = await pool.query(
        'SELECT id FROM customer WHERE user_id = ?',
        [userId]
    );
            
    if (!customerid.length) {
        return res.status(403).json({
            success: false,
            message: 'Customer account not found'
        });
    }
    const customerId = customerid[0].id;
      // Validate input
      if (!hallId || !value || value < 1 || value > 5) {
        return res.status(400).json({
          success: false,
          message: 'Invalid rating data. Value must be between 1-5'
        });
      }

      // Check if customer has bookings for this hall
      const [bookings] = await pool.query(
        `SELECT id FROM booking 
        WHERE customer_id = ? AND halls_id = ? AND approval = 'approved'`,
        [customerId, hallId]
      );

      if (bookings.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You can only rate halls you have booked'
        });
      }

      // Check for existing rating
      const [existingRating] = await pool.query(
        `SELECT id FROM rate 
        WHERE customer_id = ? AND hall_id = ?`,
        [customerId, hallId]
      );

      if (existingRating.length > 0) {
        // Update existing rating
        await pool.query(
          `UPDATE rate 
          SET value = ?, feedback = ?, created_at = CURRENT_DATE 
          WHERE id = ?`,
          [value, feedback, existingRating[0].id]
        );
      } else {
        // Create new rating
        await pool.query(
          `INSERT INTO rate 
          (value, feedback, customer_id, hall_id, created_at) 
          VALUES (?, ?, ?, ?, CURRENT_DATE)`,
          [value, feedback, customerId, hallId]
        );
      }

      res.status(200).json({
        success: true,
        message: 'Rating submitted successfully'
      });

    } catch (error) {
      console.error('Rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit rating',
        error: error.message
      });
    }
  },
  getMyRating: async (req, res) => {
    try {
      const { hallId } = req.params;
      const userId = req.user.id;
      const [customerid] = await pool.query(
        'SELECT id FROM customer WHERE user_id = ?',
        [userId]
    );
            
    if (!customerid.length) {
        return res.status(403).json({
            success: false,
            message: 'Customer account not found'
        });
    }
    const customerId = customerid[0].id;
      const [rating] = await pool.query(
        `SELECT * FROM rate 
        WHERE customer_id = ? AND hall_id = ?`,
        [customerId, hallId]
      );

      res.status(200).json({
        success: true,
        data: rating.length ? rating[0] : null
      });

    } catch (error) {
      console.error('Get rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get rating'
      });
    }
  }
};

module.exports = rateController;