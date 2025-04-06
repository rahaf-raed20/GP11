const User = require('../../models/User');
const { generateAccessToken, generateRefreshToken } = require('../../utils/token');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Verify password
    const validPassword = await User.verifyPassword(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in DB
    await User.storeRefreshToken(user.id, refreshToken);

    // Return tokens
    return res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      type: user.type
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Login failed' 
    });
  }
};

module.exports = login;