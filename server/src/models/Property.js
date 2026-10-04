const mongoose = require('mongoose');

const PROPERTY_TYPES = ['Apartment', 'Villa', 'House', 'Studio', 'Commercial', 'Land'];
const LISTING_TYPES = ['sale', 'rent'];
const MAX_IMAGES = 8;

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title must be 100 characters or fewer'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description must be 2000 characters or fewer'],
    },
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: { values: PROPERTY_TYPES, message: 'Invalid property type' },
    },
    listingType: {
      type: String,
      required: [true, 'Listing type is required'],
      enum: { values: LISTING_TYPES, message: 'Listing type must be sale or rent' },
    },
    // Sale price in rupees, or monthly rent in rupees for rentals.
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be greater than 0'],
    },
    city: { type: String, required: [true, 'City is required'], trim: true },
    state: { type: String, required: [true, 'State is required'], trim: true },
    address: { type: String, required: [true, 'Address is required'], trim: true },
    bedrooms: { type: Number, default: 0, min: [0, 'Bedrooms cannot be negative'] },
    bathrooms: { type: Number, default: 0, min: [0, 'Bathrooms cannot be negative'] },
    // Area in square feet.
    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: [1, 'Area must be greater than 0'],
    },
    images: {
      type: [String],
      validate: {
        validator: (images) => images.length <= MAX_IMAGES,
        message: `A property can have at most ${MAX_IMAGES} images`,
      },
    },
    amenities: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    // The public agent profile shown on the listing (if the agent has created one).
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    // The agent user account that owns and manages this listing.
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
module.exports.PROPERTY_TYPES = PROPERTY_TYPES;
module.exports.LISTING_TYPES = LISTING_TYPES;
