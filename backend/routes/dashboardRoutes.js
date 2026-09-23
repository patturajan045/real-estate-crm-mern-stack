const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getDashboardStats } = require('../controllers/dashboardController');

// Dashboard statistics require valid JWT authentication
router.get('/stats', authenticateToken, getDashboardStats);

module.exports = router;
