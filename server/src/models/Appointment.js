const mongoose = require('mongoose');

const APPOINTMENT_STATUSES = ['requested', 'confirmed', 'completed', 'cancelled'];

const appointmentSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: [true, 'Visit date is required'] },
    // 24-hour "HH:MM", e.g. "14:30".
    time: {
      type: String,
      required: [true, 'Visit time is required'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM format'],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message must be 500 characters or fewer'],
    },
    status: {
      type: String,
      enum: {
        values: APPOINTMENT_STATUSES,
        message: 'Status must be requested, confirmed, completed or cancelled',
      },
      default: 'requested',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
