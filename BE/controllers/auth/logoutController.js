const User = require('../../models/User');

const logout = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    
    // Remove refresh token from DB
    await User.removeRefreshToken(userId);

    return res.json({ 
      message: 'Logout successful' 
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      error: 'Logout failed' 
    });
  }
};

module.exports = logout;