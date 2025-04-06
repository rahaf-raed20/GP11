const User = require('../../models/User');
const { generateAccessToken, verifyRefreshToken } = require('../../utils/token');

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token is required' 
      });
    }

    // Verify token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Check if token exists in DB
    const tokenValid = await User.verifyRefreshToken(decoded.id, refreshToken);
    if (!tokenValid) {
      return res.status(403).json({ 
        error: 'Invalid refresh token' 
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken({ 
      id: decoded.id, 
      email: decoded.email 
    });

    return res.json({ 
      accessToken 
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: 'Invalid token' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Token refresh failed' 
    });
  }
};

module.exports = refreshToken;