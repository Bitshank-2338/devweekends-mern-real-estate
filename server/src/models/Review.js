const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
      validate: { validator: Number.isInteger, message: 'Rating must be a whole number' },
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      maxlength: [1000, 'Comment must be 1000 characters or fewer'],
    },
  },
  { timestamps: true }
);

// One review per user per property.
reviewSchema.index({ property: 1, author: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
