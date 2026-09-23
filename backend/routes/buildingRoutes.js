const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdminOrSuperAdmin } = require('../middleware/authMiddleware');
const {
  createBuilding,
  getAllBuildings,
  getBuildings,
  getBuilding,
  updateBuilding,
  deleteBuilding
} = require('../controllers/buildingController');

// All building routes require authentication
router.use(authenticateToken);

router.get('/', getAllBuildings);
router.get('/project/:project_id', getBuildings);
router.get('/:building_id', getBuilding);
router.post('/', requireAdminOrSuperAdmin, createBuilding);
router.put('/:building_id', requireAdminOrSuperAdmin, updateBuilding);
router.delete('/:building_id', requireAdminOrSuperAdmin, deleteBuilding);

module.exports = router;
