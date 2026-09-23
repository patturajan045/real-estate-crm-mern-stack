const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking
} = require('../controllers/bookingController');

// All booking routes require valid JWT authentication
router.post('/', authenticateToken, createBooking);
router.get('/', authenticateToken, getBookings);
router.get('/:booking_id', authenticateToken, getBooking);
router.post('/:booking_id/cancel', authenticateToken, cancelBooking);

module.exports = router;
