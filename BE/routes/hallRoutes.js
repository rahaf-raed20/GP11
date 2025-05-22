const express = require('express');
const router = express.Router();
const hallController = require('../controllers/hallController');
const hallChatController = require('../controllers/hallChatController');
const authenticateToken = require('../middleware/authMiddleware');

// Protect all hall routes with owner authentication
router.use(authenticateToken);


router.get('/my-halls', hallController.getHallsByOwner);// Get all halls for logged-in owner
router.post('/', hallController.createHall);            // Create new hall
router.get('/:id', hallController.getHallById);         // Get single hall
router.patch('/:id', hallController.updateHall);        // Update hall
router.delete('/:id', hallController.deleteHall);       // Delete hall

// Hall Owner Chat Routes
router.get('/chats', hallChatController.getThreads);
router.get('/chats/:threadId', hallChatController.getThreadMessages);
router.post('/chats/:threadId/reply', hallChatController.sendReply);
module.exports = router;