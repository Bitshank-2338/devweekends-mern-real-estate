const mongoose = require('mongoose');

// The public profile of an agent user. One profile per agent account.
const agentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    agency: {
      type: String,
      required: [true, 'Agency name is required'],
      trim: true,
      maxlength: [80, 'Agency name must be 80 characters or fewer'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9+\-\s]{7,16}$/, 'Please enter a valid phone number'],
    },
    city: { type: String, required: [true, 'City is required'], trim: true },
    bio: {
      type: String,
      trim: true,
      maxlength: [600, 'Bio must be 600 characters or fewer'],
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: [0, 'Experience cannot be negative'],
      max: [60, 'Experience must be 60 years or fewer'],
    },
    specialties: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Agent', agentSchema);
