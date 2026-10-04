const express = require('express');
const {
  getAgents,
  getMyAgentProfile,
  getAgentById,
  createAgentProfile,
  updateAgentProfile,
  deleteAgentProfile,
} = require('../controllers/agentController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getAgents);
router.get('/me', protect, authorize('agent'), getMyAgentProfile);
router.get('/:id', getAgentById);

router.post('/', protect, authorize('agent'), createAgentProfile);
router.put('/:id', protect, authorize('agent'), updateAgentProfile);
router.delete('/:id', protect, authorize('agent'), deleteAgentProfile);

module.exports = router;
