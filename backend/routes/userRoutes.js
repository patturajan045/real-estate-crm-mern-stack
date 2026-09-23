const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdminOrSuperAdmin } = require('../middleware/authMiddleware');
const {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  toggleActive,
  resetPassword,
  deleteUser
} = require('../controllers/userController');

// All user management routes require authenticated token
router.use(authenticateToken);

router.get('/', getAllUsers);
router.post('/', requireAdminOrSuperAdmin, createUser);
router.get('/:user_id', getUser);
router.put('/:user_id', requireAdminOrSuperAdmin, updateUser);
router.patch('/:user_id/toggle-active', requireAdminOrSuperAdmin, toggleActive);
router.post('/:user_id/reset-password', requireAdminOrSuperAdmin, resetPassword);
router.delete('/:user_id', requireAdminOrSuperAdmin, deleteUser);

module.exports = router;
