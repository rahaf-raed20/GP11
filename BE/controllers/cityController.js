const pool = require('../config/db');

const cityController = {
    getAllCities: async (req, res) => {
        try {
            const [cities] = await pool.query('SELECT * FROM city');
            
            return res.status(200).json({
                success: true,
                data: cities,
                message: 'Cities retrieved successfully'
            });
            
        } catch (error) {
            console.error('Error fetching cities:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve cities',
                error: process.env.NODE_ENV === 'development' ? error.message : null
            });
        }
    },

    getCityById: async (req, res) => {
        try {
            const { id } = req.params;
            const [city] = await pool.query('SELECT * FROM city WHERE id = ?', [id]);
            
            if (city.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'City not found'
                });
            }
            
            return res.status(200).json({
                success: true,
                data: city[0],
                message: 'City retrieved successfully'
            });
            
        } catch (error) {
            console.error('Error fetching city:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve city',
                error: process.env.NODE_ENV === 'development' ? error.message : null
            });
        }
    }
};

module.exports = cityController;