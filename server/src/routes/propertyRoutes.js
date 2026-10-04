const express = require('express');
const {
  getProperties,
  getMyProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getProperties);
// Must come before '/:id', otherwise "mine" would be treated as an id.
router.get('/mine', protect, authorize('agent'), getMyProperties);
router.get('/:id', getPropertyById);

router.post('/', protect, authorize('agent'), createProperty);
router.put('/:id', protect, authorize('agent'), updateProperty);
router.delete('/:id', protect, authorize('agent'), deleteProperty);

module.exports = router;
