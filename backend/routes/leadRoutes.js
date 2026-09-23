const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  addLeadNote
} = require('../controllers/leadController');

// All lead pipeline routes require valid JWT authentication
router.post('/', authenticateToken, createLead);
router.get('/', authenticateToken, getLeads);
router.get('/:lead_id', authenticateToken, getLead);
router.put('/:lead_id', authenticateToken, updateLead);
router.delete('/:lead_id', authenticateToken, deleteLead);
router.post('/:lead_id/notes', authenticateToken, addLeadNote);

module.exports = router;
