const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdminOrSuperAdmin } = require('../middleware/authMiddleware');
const {
  createUnit,
  getAllUnits,
  getUnits,
  getUnit,
  updateUnit,
  updateUnitStatus,
  deleteUnit
} = require('../controllers/unitController');

// All unit routes require authentication
router.use(authenticateToken);

router.get('/', getAllUnits);
router.get('/building/:building_id', getUnits);
router.get('/:unit_id', getUnit);
router.post('/', requireAdminOrSuperAdmin, createUnit);
router.put('/:unit_id', requireAdminOrSuperAdmin, updateUnit);
router.patch('/:unit_id/status', updateUnitStatus);
router.delete('/:unit_id', requireAdminOrSuperAdmin, deleteUnit);

module.exports = router;
