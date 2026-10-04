const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const httpError = require('../utils/httpError');
const pickFields = require('../utils/pickFields');
const participantFilter = require('../utils/participantFilter');

// The buyer can edit what they wrote, the agent can only move the status along.
const BUYER_FIELDS = ['message', 'phone'];
const AGENT_FIELDS = ['status'];

const RELATED = [
  { path: 'property', select: 'title city price listingType images' },
  { path: 'buyer', select: 'name email' },
  { path: 'agent', select: 'name email' },
];

// POST /api/inquiries  (buyer)
async function createInquiry(req, res) {
  const { property: propertyId, message, phone } = req.body || {};
  if (!propertyId) throw httpError(400, 'Property is required');

  const property = await Property.findById(propertyId);
  if (!property) throw httpError(404, 'Property not found');

  const inquiry = await Inquiry.create({
    property: property._id,
    buyer: req.user._id,
    // The receiving agent comes from the property, never from the request body.
    agent: property.owner,
    message,
    phone,
  });

  await inquiry.populate(RELATED);
  res.status(201).json({ inquiry });
}

// GET /api/inquiries  (buyer: sent, agent: received)
async function getInquiries(req, res) {
  const inquiries = await Inquiry.find(participantFilter(req.user))
    .sort({ createdAt: -1 })
    .populate(RELATED);

  res.json({ count: inquiries.length, inquiries });
}

// GET /api/inquiries/:id  (buyer or agent of this inquiry)
async function getInquiryById(req, res) {
  const inquiry = await Inquiry.findOne({ _id: req.params.id, ...participantFilter(req.user) }).populate(
    RELATED
  );
  if (!inquiry) throw httpError(404, 'Inquiry not found');

  res.json({ inquiry });
}

// PUT /api/inquiries/:id  (buyer edits message/phone, agent updates status)
async function updateInquiry(req, res) {
  const inquiry = await Inquiry.findOne({ _id: req.params.id, ...participantFilter(req.user) });
  if (!inquiry) throw httpError(404, 'Inquiry not found');

  const isBuyer = inquiry.buyer.equals(req.user._id);
  Object.assign(inquiry, pickFields(req.body, isBuyer ? BUYER_FIELDS : AGENT_FIELDS));
  await inquiry.save();

  await inquiry.populate(RELATED);
  res.json({ inquiry });
}

// DELETE /api/inquiries/:id  (buyer who sent it)
async function deleteInquiry(req, res) {
  const inquiry = await Inquiry.findOneAndDelete({ _id: req.params.id, buyer: req.user._id });
  if (!inquiry) throw httpError(404, 'Inquiry not found');

  res.json({ message: 'Inquiry deleted', id: inquiry._id });
}

module.exports = { createInquiry, getInquiries, getInquiryById, updateInquiry, deleteInquiry };
