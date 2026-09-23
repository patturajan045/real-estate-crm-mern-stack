const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdminOrSuperAdmin } = require('../middleware/authMiddleware');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

// All project routes require authentication
router.use(authenticateToken);

router.get('/', getProjects);
router.get('/:project_id', getProject);
router.post('/', requireAdminOrSuperAdmin, createProject);
router.put('/:project_id', requireAdminOrSuperAdmin, updateProject);
router.delete('/:project_id', requireAdminOrSuperAdmin, deleteProject);

module.exports = router;
