// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticateToken = require('../middleware/authMiddleware');


// Owner-only routes
router.use(authenticateToken);
// router.use(checkOwner); // Uncomment if you have role middleware

router.post('/', bookingController.createBooking);
router.patch('/:bookingId/status', bookingController.updateBookingStatus);
router.get('/hall/:hallId', authenticateToken, bookingController.getHallBookings);
router.patch('/:id', authenticateToken, bookingController.updateBooking);
module.exports = router;