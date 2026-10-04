const mongoose = require('mongoose');

const INQUIRY_STATUSES = ['new', 'contacted', 'closed'];

const inquirySchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    // The buyer who sent the inquiry and owns it.
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // The agent who owns the property and receives the inquiry.
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'Message must be 1000 characters or fewer'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s]{7,16}$/, 'Please enter a valid phone number'],
    },
    status: {
      type: String,
      enum: { values: INQUIRY_STATUSES, message: 'Status must be new, contacted or closed' },
      default: 'new',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
