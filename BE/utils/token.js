const jwt = require('jsonwebtoken');
require('dotenv').config();

// utils/token.js
const generateAccessToken = (user) => {
  return jwt.sign(
      { 
          id: user.id, 
          email: user.email,
          type: user.type // Include type in token
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
      { 
          id: user.id,
          type: user.type // Include type in refresh token
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
  );
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
};
