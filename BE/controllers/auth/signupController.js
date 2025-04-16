const User = require('../../models/User');

const signup = async (req, res) => {
  try {
    const { fname, mname, lname, email, password, city_id , type} = req.body;

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Email already in use' 
      });
    }

    // Create user without generating tokens
    const userId = await User.create({
      fname, mname, lname, email, password, city_id , type
    });

    // Return success response without tokens
    return res.status(201).json({ 
      message: 'User registered successfully',
      user: { id: userId, email }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ 
      error: 'Registration failed' 
    });
  }
};

module.exports = signup;