const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'estateflow_jwt_secret_key_2026_secure';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub || decoded.id;
    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ status: 'error', message: 'User not found or inactive' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    req.userId = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub || decoded.id;
    const user = await User.findById(userId);
    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
    }
  } catch (err) {
    // Ignore invalid token in optional auth
  }
  next();
}

function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'Super Admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Only Super Admin can modify platform settings.'
    });
  }
  next();
}

function requireAdminOrSuperAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'Super Admin' && req.user.role !== 'Admin')) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Administrator privileges required.'
    });
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireSuperAdmin,
  requireAdminOrSuperAdmin,
  JWT_SECRET
};
