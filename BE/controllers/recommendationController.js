const pool = require('../config/db');

const recommendationController = {
  getRecommendedHalls: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get customer's city
      const [user] = await pool.query(
        'SELECT city_id FROM user WHERE id = ?', 
        [userId]
      );
      
      if (!user.length) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const cityId = user[0].city_id;
      
      // Get recommended halls (same city first, then others)
      const [halls] = await pool.query(`
        SELECT 
          h.*,
          c.name as city_name,
          (SELECT AVG(value) FROM rate WHERE hall_id = h.id) as avg_rating,
          (SELECT COUNT(*) FROM rate WHERE hall_id = h.id) as rating_count,
          CASE WHEN h.city_id = ? THEN 1 ELSE 0 END as priority
        FROM halls h
        JOIN city c ON h.city_id = c.id
        ORDER BY priority DESC, avg_rating DESC
        LIMIT 20
      `, [cityId]);
      
      res.status(200).json({ success: true, data: halls });
    } catch (error) {
      console.error('Recommendation error:', error);
      res.status(500).json({ success: false, message: 'Failed to get recommendations' });
    }
  },

  getRecommendedThirdParties: async (req, res) => {
    try {
      const { hallId } = req.query;
      
      // Get hall's city
      const [hall] = await pool.query(
        'SELECT city_id FROM halls WHERE id = ?', 
        [hallId]
      );
      
      if (!hall.length) {
        return res.status(404).json({ success: false, message: 'Hall not found' });
      }
      
      const cityId = hall[0].city_id;
      
      // Get recommended third parties in the same city
      const [companies] = await pool.query(`
        SELECT 
          tpc.*,
          tc.type as category,
          c.name as city_name
        FROM third_party_company tpc
        JOIN third_category tc ON tpc.category_id = tc.id
        JOIN city c ON tpc.city_id = c.id
        WHERE tpc.city_id = ?
        LIMIT 10
      `, [cityId]);
      
      res.status(200).json({ success: true, data: companies });
    } catch (error) {
      console.error('Third party recommendation error:', error);
      res.status(500).json({ success: false, message: 'Failed to get recommendations' });
    }
  }
};

module.exports = recommendationController;