const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { hashPassword, verifyPassword } = require('../utils/passwordUtils');
const { JWT_SECRET } = require('../middleware/authMiddleware');

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

async function register(req, res) {
  try {
    const data = req.body || {};

    if (!data.name || !data.email || !data.password) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields (name, email, password)'
      });
    }

    const email = data.email.trim().toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        status: 'error',
        message: 'Email already registered'
      });
    }

    // Self-registration is strictly restricted to Sales Employees
    const role = User.ROLE_SALES;

    const user = await User.create({
      name: data.name.trim(),
      email,
      phoneNumber: data.phoneNumber || '',
      password: hashPassword(data.password),
      role
    });

    const token = jwt.sign({ sub: user._id, id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      status: 'success',
      message: 'Registered Successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: `Server error: ${err.message}`
    });
  }
}

async function login(req, res) {
  try {
    const data = req.body || {};
    const identifier = (data.email || data.username || data.login || '').trim();
    const password = data.password;

    if (!identifier || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email/Username and password are required'
      });
    }

    const safeRegex = new RegExp('^' + escapeRegex(identifier) + '$', 'i');
    let user = await User.findOne({ email: safeRegex });
    if (!user) {
      user = await User.findOne({ name: safeRegex });
    }

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email/username or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Account is deactivated'
      });
    }

    const token = jwt.sign({ sub: user._id, id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token,
      redirect: '/dashboard',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: `Server error: ${err.message}`
    });
  }
}

async function logout(req, res) {
  return res.status(200).json({
    status: 'success',
    message: 'Successfully logged out'
  });
}

async function getMe(req, res) {
  try {
    const user = req.user;
    if (!user || !user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found or inactive'
      });
    }
    return res.status(200).json({
      status: 'success',
      user: user.toJSON()
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe
};
