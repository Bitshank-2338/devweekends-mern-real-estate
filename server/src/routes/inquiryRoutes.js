const express = require('express');
const {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiry,
  deleteInquiry,
} = require('../controllers/inquiryController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// Every inquiry route needs a logged-in user.
router.use(protect);

router.post('/', authorize('buyer'), createInquiry);
router.get('/', getInquiries);
router.get('/:id', getInquiryById);
router.put('/:id', updateInquiry);
router.delete('/:id', authorize('buyer'), deleteInquiry);

module.exports = router;
