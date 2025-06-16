const pool = require('../config/db');
const natural = require('natural');
const { PorterStemmer } = natural;
const tfidf = new natural.TfIdf();

class RecommendationSystem {
  constructor() {
    this.hallsData = [];
    this.cityHallsMap = new Map();
  }

  // Initialize with hall data
  async initialize() {
    const [halls] = await pool.query(`
      SELECT h.*, c.name as city_name, 
      GROUP_CONCAT(hf.name) as features
      FROM halls h
      JOIN city c ON h.city_id = c.id
      LEFT JOIN hall_feature_mappings hfm ON h.id = hfm.hall_id
      LEFT JOIN hall_features hf ON hfm.feature_id = hf.id
      GROUP BY h.id
    `);

    this.hallsData = halls;
    this.buildCityIndex();
    this.trainTFIDF();
  }

  // Build city to halls index
  buildCityIndex() {
    this.cityHallsMap = new Map();
    this.hallsData.forEach(hall => {
      if (!this.cityHallsMap.has(hall.city_id)) {
        this.cityHallsMap.set(hall.city_id, []);
      }
      this.cityHallsMap.get(hall.city_id).push(hall);
    });
  }

  // Train TF-IDF model on hall features and descriptions
  trainTFIDF() {
    this.hallsData.forEach(hall => {
      const text = [
        hall.name,
        hall.features || '',
        `capacity ${hall.capacity}`,
        `price ${hall.price_per_hour}`
      ].join(' ');
      
      tfidf.addDocument(text);
    });
  }

  // Get recommendations for a user in their city
  async recommendInMyCity(userId, limit = 5) {
    // Get user's city
    const [users] = await pool.query(
      'SELECT city_id FROM user WHERE id = ?', 
      [userId]
    );
    
    if (!users.length) return [];
    
    const userCityId = users[0].city_id;
    return this.recommendByCity(userCityId, limit);
  }

  // Get recommendations for any city
  async recommendByCity(cityId, limit = 5) {
    if (!this.cityHallsMap.has(cityId)) return [];
    
    const cityHalls = this.cityHallsMap.get(cityId);
    if (cityHalls.length <= limit) return cityHalls;
    
    // Simple recommendation logic - could be enhanced
    return cityHalls
      .sort((a, b) => {
        // Sort by rating (if available) then by price
        const ratingA = a.average_rating || 0;
        const ratingB = b.average_rating || 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return a.price_per_hour - b.price_per_hour;
      })
      .slice(0, limit);
  }

  // Get similar halls based on a hall ID (content-based)
  async getSimilarHalls(hallId, limit = 5) {
    const hall = this.hallsData.find(h => h.id === hallId);
    if (!hall) return [];

    const hallText = [
      hall.name,
      hall.features || '',
      `capacity ${hall.capacity}`,
      `price ${hall.price_per_hour}`
    ].join(' ');

    // Find similar halls using TF-IDF cosine similarity
    const scores = [];
    tfidf.tfidfs(hallText, (i, measure) => {
      if (this.hallsData[i].id !== hallId) { // Exclude self
        scores.push({
          hall: this.hallsData[i],
          score: measure
        });
      }
    });

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.hall);
  }
}

// Singleton instance
const recommendationSystem = new RecommendationSystem();
recommendationSystem.initialize();

module.exports = {
  // Get recommendations for user's city
  getLocalRecommendations: async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 5 } = req.query;
      const recommendations = await recommendationSystem.recommendInMyCity(userId, parseInt(limit));
      
      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('Recommendation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recommendations'
      });
    }
  },

  // Get recommendations for any city
  getCityRecommendations: async (req, res) => {
    try {
      const { cityId, limit = 5 } = req.query;
      const recommendations = await recommendationSystem.recommendByCity(parseInt(cityId), parseInt(limit));
      
      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('Recommendation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recommendations'
      });
    }
  },

  // Get similar halls (content-based)
  getSimilarHalls: async (req, res) => {
    try {
      const { hallId, limit = 5 } = req.query;
      const similarHalls = await recommendationSystem.getSimilarHalls(parseInt(hallId), parseInt(limit));
      
      res.json({
        success: true,
        data: similarHalls
      });
    } catch (error) {
      console.error('Similar halls error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to find similar halls'
      });
    }
  }
};