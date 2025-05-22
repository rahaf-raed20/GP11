const pool = require('../config/db');

const searchController = {
  searchHalls: async (req, res) => {
    try {
      const { location, minCapacity, maxPrice, date } = req.query;
      
      let query = `
        SELECT 
          h.*, 
          c.name as city_name,
          (SELECT AVG(value) FROM rate WHERE hall_id = h.id) as avg_rating
        FROM halls h
        JOIN city c ON h.city_id = c.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (location) {
        query += ' AND c.name LIKE ?';
        params.push(`%${location}%`);
      }
      
      if (minCapacity) {
        query += ' AND h.capacity >= ?';
        params.push(minCapacity);
      }
      
      if (maxPrice) {
        query += ' AND h.price_per_hour <= ?';
        params.push(maxPrice);
      }
      
      // Add date availability check if provided
      if (date) {
        query += `
          AND h.id NOT IN (
            SELECT halls_id FROM booking 
            WHERE event_date = ? AND approval = 'approved'
          )
          AND h.id NOT IN (
            SELECT Halls_id FROM vacation_days WHERE date = ?
          )
        `;
        params.push(date, date);
      }
      
      query += ' ORDER BY avg_rating DESC LIMIT 50';
      
      const [halls] = await pool.query(query, params);
      
      res.status(200).json({ success: true, data: halls });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ success: false, message: 'Search failed' });
    }
  },

  searchThirdParties: async (req, res) => {
    try {
      const { type, city } = req.query;
      
      let query = `
        SELECT 
          tpc.*,
          tc.type as category,
          c.name as city_name
        FROM third_party_company tpc
        JOIN third_category tc ON tpc.category_id = tc.id
        JOIN city c ON tpc.city_id = c.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (type) {
        query += ' AND tc.type LIKE ?';
        params.push(`%${type}%`);
      }
      
      if (city) {
        query += ' AND c.name LIKE ?';
        params.push(`%${city}%`);
      }
      
      query += ' ORDER BY tpc.name ASC LIMIT 50';
      
      const [companies] = await pool.query(query, params);
      
      res.status(200).json({ success: true, data: companies });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ success: false, message: 'Search failed' });
    }
  }
};

module.exports = searchController;