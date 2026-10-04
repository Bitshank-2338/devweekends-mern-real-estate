const express = require('express');
const {
  getReviews,
  getMyReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getReviews);
router.get('/mine', protect, getMyReviews);
router.get('/:id', getReviewById);

router.post('/', protect, authorize('buyer'), createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
