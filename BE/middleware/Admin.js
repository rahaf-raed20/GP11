const jwt = require('jsonwebtoken');
require('dotenv').config();

// Admin authorization middleware
const authorizeAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Check if user is admin
    const [admin] = await pool.query(
      'SELECT id FROM admin WHERE user_id = ?',
      [userId]
    );
    
    if (!admin.length) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify admin access' 
    });
  }
};

module.exports = authorizeAdmin;