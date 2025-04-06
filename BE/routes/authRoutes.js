const express = require('express');
const router = express.Router();

const { validateSignup, validateLogin } = require('../middleware/validationMiddleware');
const authenticateToken = require('../middleware/authMiddleware');
const signup = require('../controllers/auth/signupController');
const login = require('../controllers/auth/loginController');
const logout = require('../controllers/auth/logoutController');
const refreshToken = require('../controllers/auth/refreshTokenController');

// Public routes
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.post('/refresh-token', refreshToken);

module.exports = router;