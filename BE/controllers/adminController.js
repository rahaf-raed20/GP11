const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');

const adminController = {
  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ success: false, message: 'Failed to get users' });
    }
  },

  // Get users by type
  getUsersByType: async (req, res) => {
    try {
      const { type } = req.params;
      const users = await User.getUsersByType(parseInt(type));
      res.json({ success: true, data: users });
    } catch (error) {
      console.error('Error getting users by type:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // Search users by email
  searchUsers: async (req, res) => {
    try {
      const { email } = req.query;
      const users = await User.searchByEmail(email);
      res.json({ success: true, data: users });
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ success: false, message: 'Failed to search users' });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      await User.update(id, req.body);
      res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      await User.delete(id);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
  },

  // Impersonate user (login as another user)
  impersonateUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const tokens = await User.impersonate(userId);
      
      res.json({
        success: true,
        message: 'Impersonation successful',
        data: tokens
      });
    } catch (error) {
      console.error('Impersonation error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
};

module.exports = adminController;