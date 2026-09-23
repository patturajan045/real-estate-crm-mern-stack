const express = require('express');
const router = express.Router();
const { authenticateToken, requireSuperAdmin } = require('../middleware/authMiddleware');
const {
  getAllContent,
  getGroupedContent,
  updateContent,
  batchUpdateContent,
  resetDefaultContent
} = require('../controllers/cmsController');

router.get('/content', getAllContent);
router.get('/content/grouped', getGroupedContent);
router.put('/content/batch', authenticateToken, requireSuperAdmin, batchUpdateContent);
router.post('/content/batch', authenticateToken, requireSuperAdmin, batchUpdateContent);
router.put('/content/:section_key', authenticateToken, requireSuperAdmin, updateContent);
router.post('/reset', authenticateToken, requireSuperAdmin, resetDefaultContent);

module.exports = router;
