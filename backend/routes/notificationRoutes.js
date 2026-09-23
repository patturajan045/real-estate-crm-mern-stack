const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getUserNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead
} = require('../controllers/notificationController');

router.get('/', authenticateToken, getUserNotifications);
router.get('/unread-count', authenticateToken, getUnreadCount);
router.post('/:notification_id/read', authenticateToken, markNotificationRead);
router.patch('/:notification_id/read', authenticateToken, markNotificationRead);
router.post('/mark-all-read', authenticateToken, markAllRead);
router.post('/read-all', authenticateToken, markAllRead);

module.exports = router;
