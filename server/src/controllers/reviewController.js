const Review = require('../models/Review');
const Property = require('../models/Property');
const httpError = require('../utils/httpError');
const pickFields = require('../utils/pickFields');

const EDITABLE_FIELDS = ['rating', 'comment'];

const RELATED = [
  { path: 'author', select: 'name' },
  { path: 'property', select: 'title city' },
];

// GET /api/reviews?property=<id>  (public)
async function getReviews(req, res) {
  const filter = req.query.property ? { property: String(req.query.property) } : {};
  const reviews = await Review.find(filter).sort({ createdAt: -1 }).limit(100).populate(RELATED);

  res.json({ count: reviews.length, reviews });
}

// GET /api/reviews/mine  (logged in) - reviews written by the current user
async function getMyReviews(req, res) {
  const reviews = await Review.find({ author: req.user._id }).sort({ createdAt: -1 }).populate(RELATED);
  res.json({ count: reviews.length, reviews });
}

// GET /api/reviews/:id  (public)
async function getReviewById(req, res) {
  const review = await Review.findById(req.params.id).populate(RELATED);
  if (!review) throw httpError(404, 'Review not found');

  res.json({ review });
}

// POST /api/reviews  (buyer)
async function createReview(req, res) {
  const { property: propertyId, rating, comment } = req.body || {};
  if (!propertyId) throw httpError(400, 'Property is required');

  const property = await Property.findById(propertyId);
  if (!property) throw httpError(404, 'Property not found');

  const alreadyReviewed = await Review.exists({ property: property._id, author: req.user._id });
  if (alreadyReviewed) throw httpError(409, 'You have already reviewed this property');

  const review = await Review.create({
    property: property._id,
    author: req.user._id,
    rating,
    comment,
  });

  await review.populate(RELATED);
  res.status(201).json({ review });
}

// PUT /api/reviews/:id  (author only)
async function updateReview(req, res) {
  const review = await Review.findOne({ _id: req.params.id, author: req.user._id });
  if (!review) throw httpError(404, 'Review not found');

  Object.assign(review, pickFields(req.body, EDITABLE_FIELDS));
  await review.save();

  await review.populate(RELATED);
  res.json({ review });
}

// DELETE /api/reviews/:id  (author only)
async function deleteReview(req, res) {
  const review = await Review.findOneAndDelete({ _id: req.params.id, author: req.user._id });
  if (!review) throw httpError(404, 'Review not found');

  res.json({ message: 'Review deleted', id: review._id });
}

module.exports = {
  getReviews,
  getMyReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};
