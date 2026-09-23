const User = require('../models/User');
const Lead = require('../models/Lead');
const { hashPassword } = require('../utils/passwordUtils');

async function createUser(req, res) {
  try {
    const data = req.body || {};
    const { name, email, password } = data;
    const role = data.role || User.ROLE_SALES;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: name, email, password'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phoneNumber: data.phoneNumber || '',
      password: hashPassword(password),
      role: role,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
    });

    return res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: newUser.toJSON()
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: `Server error: ${err.message}`
    });
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await User.find().sort({ addedTime: -1 });
    return res.status(200).json({
      status: 'success',
      data: users.map(u => u.toJSON())
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: `Server error: ${err.message}`
    });
  }
}

async function getUser(req, res) {
  try {
    const { user_id } = req.params;
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    return res.status(200).json({ status: 'success', data: user.toJSON() });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: `Server error: ${err.message}` });
  }
}

async function updateUser(req, res) {
  try {
    const { user_id } = req.params;
    const data = req.body || {};

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (data.name !== undefined) user.name = data.name.trim();
    if (data.phoneNumber !== undefined) user.phoneNumber = data.phoneNumber;
    if (data.role && User.ROLES.includes(data.role)) user.role = data.role;
    if (data.isActive !== undefined) user.isActive = Boolean(data.isActive);
    if (data.is_active !== undefined) user.isActive = Boolean(data.is_active);
    if (data.password) user.password = hashPassword(data.password);

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: user.toJSON()
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: `Server error: ${err.message}` });
  }
}

async function toggleActive(req, res) {
  try {
    const { user_id } = req.params;
    const { is_active, isActive } = req.body || {};
    const activeValue = is_active !== undefined ? Boolean(is_active) : (isActive !== undefined ? Boolean(isActive) : false);

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    user.isActive = activeValue;
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: `User '${user.name}' status updated to ${user.isActive ? 'Active' : 'Inactive'}`,
      data: user.toJSON()
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: `Server error: ${err.message}` });
  }
}

async function resetPassword(req, res) {
  try {
    const { user_id } = req.params;
    const { password } = req.body || {};

    if (!password || password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    user.password = hashPassword(password);
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: `Password reset successfully for '${user.name}'`,
      data: user.toJSON()
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: `Server error: ${err.message}` });
  }
}

async function deleteUser(req, res) {
  try {
    const { user_id } = req.params;
    const currentUserId = req.userId;

    if (currentUserId && String(currentUserId) === String(user_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot delete your own account.'
      });
    }

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const isPermanent = req.query.permanent === 'true' || !user.isActive;

    if (isPermanent) {
      // Nullify all leads assigned to this user
      await Lead.updateMany({ assignedTo: user._id }, { $set: { assignedTo: null } });
      const userName = user.name;
      await user.deleteOne();
      return res.status(200).json({
        status: 'success',
        message: `User '${userName}' permanently deleted successfully`
      });
    } else {
      // Deactivate active user
      user.isActive = false;
      await user.save();
      return res.status(200).json({
        status: 'success',
        message: `User '${user.name}' deactivated successfully. Inactive users can now be permanently deleted.`,
        data: user.toJSON()
      });
    }
  } catch (err) {
    return res.status(500).json({ status: 'error', message: `Server error: ${err.message}` });
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  toggleActive,
  resetPassword,
  deleteUser
};
