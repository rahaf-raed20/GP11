const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const bookingController = require('../controllers/bookingController');
const searchController = require('../controllers/searchController');
const hallController = require('../controllers/hallController');
const thirdPartyController = require('../controllers/thirdPartyController');
const chatController = require('../controllers/chatController');
const hallChatController = require('../controllers/hallChatController');
const thirdPartyChatController = require('../controllers/thirdPartyChatController');
const customerController = require('../controllers/customerController');
const authenticateToken = require('../middleware/authMiddleware');


// Apply authentication to all customer routes
router.use(authenticateToken);

// Recommendation routes
router.get('/recommendations/halls', recommendationController.getRecommendedHalls);
router.get('/recommendations/third-parties', recommendationController.getRecommendedThirdParties);

// Booking routes
router.post('/bookings/halls', bookingController.createHallBooking);
router.post('/bookings/:bookingId/services', bookingController.addServiceToBooking);

// Search routes
router.get('/search/halls', searchController.searchHalls);
router.get('/search/third-parties', searchController.searchThirdParties);

// Detail routes
router.get('/halls/:id', hallController.getHallDetails);
router.get('/third-parties/:id', thirdPartyController.getThirdPartyDetails);

// Chat routes
router.post('/chat/threads', chatController.startChatThread);
router.post('/chat/threads/:threadId/messages', chatController.sendMessage);
router.get('/chat/threads', chatController.getChatThreads);
router.get('/chat/threads/:threadId/messages', chatController.getThreadMessages);

// my booking
router.get('/bookings', customerController.getBookings);
router.put('/bookings/:id', customerController.updateBooking); 

// Profile routes
router.get('/profile', customerController.getProfile);
router.put('/profile', customerController.updateProfile); 

module.exports = router;