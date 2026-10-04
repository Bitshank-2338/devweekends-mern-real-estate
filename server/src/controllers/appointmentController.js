const Appointment = require('../models/Appointment');
const Property = require('../models/Property');
const httpError = require('../utils/httpError');
const pickFields = require('../utils/pickFields');
const participantFilter = require('../utils/participantFilter');

// The buyer can reschedule or cancel. The agent can confirm, complete or cancel.
const BUYER_FIELDS = ['date', 'time', 'message'];
const AGENT_FIELDS = ['status'];

const RELATED = [
  { path: 'property', select: 'title city address images' },
  { path: 'buyer', select: 'name email' },
  { path: 'agent', select: 'name email' },
];

// Compares "YYYY-MM-DD" strings, so a visit can be booked for today but not yesterday.
function isPastDate(date) {
  const today = new Date().toISOString().slice(0, 10);
  return new Date(date).toISOString().slice(0, 10) < today;
}

function assertValidVisitDate(date) {
  if (!date || Number.isNaN(new Date(date).getTime())) {
    throw httpError(400, 'Please choose a valid visit date');
  }
  if (isPastDate(date)) {
    throw httpError(400, 'Visit date cannot be in the past');
  }
}

// POST /api/appointments  (buyer)
async function createAppointment(req, res) {
  const { property: propertyId, date, time, message } = req.body || {};
  if (!propertyId) throw httpError(400, 'Property is required');
  assertValidVisitDate(date);

  const property = await Property.findById(propertyId);
  if (!property) throw httpError(404, 'Property not found');

  const appointment = await Appointment.create({
    property: property._id,
    buyer: req.user._id,
    agent: property.owner,
    date,
    time,
    message,
  });

  await appointment.populate(RELATED);
  res.status(201).json({ appointment });
}

// GET /api/appointments  (buyer: requested visits, agent: visits to their properties)
async function getAppointments(req, res) {
  const appointments = await Appointment.find(participantFilter(req.user))
    .sort({ date: 1, time: 1 })
    .populate(RELATED);

  res.json({ count: appointments.length, appointments });
}

// GET /api/appointments/:id  (buyer or agent of this appointment)
async function getAppointmentById(req, res) {
  const appointment = await Appointment.findOne({
    _id: req.params.id,
    ...participantFilter(req.user),
  }).populate(RELATED);
  if (!appointment) throw httpError(404, 'Appointment not found');

  res.json({ appointment });
}

// PUT /api/appointments/:id
async function updateAppointment(req, res) {
  const appointment = await Appointment.findOne({
    _id: req.params.id,
    ...participantFilter(req.user),
  });
  if (!appointment) throw httpError(404, 'Appointment not found');

  const isBuyer = appointment.buyer.equals(req.user._id);

  if (isBuyer) {
    const changes = pickFields(req.body, BUYER_FIELDS);
    if (changes.date !== undefined) assertValidVisitDate(changes.date);
    Object.assign(appointment, changes);

    // A new date or time needs the agent to confirm again.
    if (changes.date !== undefined || changes.time !== undefined) {
      appointment.status = 'requested';
    }
    // The only status a buyer may set is "cancelled".
    if (req.body?.status === 'cancelled') {
      appointment.status = 'cancelled';
    }
  } else {
    Object.assign(appointment, pickFields(req.body, AGENT_FIELDS));
  }

  await appointment.save();
  await appointment.populate(RELATED);
  res.json({ appointment });
}

// DELETE /api/appointments/:id  (buyer who requested it)
async function deleteAppointment(req, res) {
  const appointment = await Appointment.findOneAndDelete({ _id: req.params.id, buyer: req.user._id });
  if (!appointment) throw httpError(404, 'Appointment not found');

  res.json({ message: 'Appointment deleted', id: appointment._id });
}

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};
