const Property = require('../models/Property');
const Agent = require('../models/Agent');
const Inquiry = require('../models/Inquiry');
const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const httpError = require('../utils/httpError');
const pickFields = require('../utils/pickFields');

// Fields an agent may set. owner and agent are always decided by the server.
const EDITABLE_FIELDS = [
  'title',
  'description',
  'propertyType',
  'listingType',
  'price',
  'city',
  'state',
  'address',
  'bedrooms',
  'bathrooms',
  'area',
  'images',
  'amenities',
  'featured',
];

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  'price-low': { price: 1 },
  'price-high': { price: -1 },
};

const MAX_RESULTS = 60;

const AGENT_DETAILS = {
  path: 'agent',
  select: 'agency phone city experienceYears user',
  populate: { path: 'user', select: 'name email' },
};

function toNumber(value) {
  const number = Number(value);
  return value !== undefined && value !== '' && Number.isFinite(number) ? number : undefined;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Turns query-string filters into a MongoDB filter object.
// Example: ?city=Pune&listingType=rent&bedrooms=2
function buildFilter(query) {
  const filter = {};

  if (query.city) {
    // Case-insensitive "starts with", so "ben" matches "Bengaluru".
    filter.city = { $regex: `^${escapeRegex(String(query.city).trim())}`, $options: 'i' };
  }
  if (query.propertyType) filter.propertyType = String(query.propertyType);
  if (query.listingType) filter.listingType = String(query.listingType);
  if (query.featured === 'true') filter.featured = true;

  const bedrooms = toNumber(query.bedrooms);
  if (bedrooms !== undefined) filter.bedrooms = { $gte: bedrooms };

  const minPrice = toNumber(query.minPrice);
  const maxPrice = toNumber(query.maxPrice);
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  return filter;
}

// GET /api/properties  (public, supports search + filters + sort)
async function getProperties(req, res) {
  const filter = buildFilter(req.query);
  const sort = SORT_OPTIONS[req.query.sort] || SORT_OPTIONS.newest;
  const limit = Math.min(toNumber(req.query.limit) || MAX_RESULTS, MAX_RESULTS);

  const properties = await Property.find(filter)
    .sort(sort)
    .limit(limit)
    .populate('owner', 'name');

  res.json({ count: properties.length, properties });
}

// GET /api/properties/mine  (agent) - the logged-in agent's own listings
async function getMyProperties(req, res) {
  const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ count: properties.length, properties });
}

// GET /api/properties/:id  (public)
async function getPropertyById(req, res) {
  const property = await Property.findById(req.params.id)
    .populate('owner', 'name')
    .populate(AGENT_DETAILS);

  if (!property) throw httpError(404, 'Property not found');
  res.json({ property });
}

// POST /api/properties  (agent)
async function createProperty(req, res) {
  const profile = await Agent.findOne({ user: req.user._id });

  const property = await Property.create({
    ...pickFields(req.body, EDITABLE_FIELDS),
    owner: req.user._id,
    agent: profile?._id,
  });

  res.status(201).json({ property });
}

// PUT /api/properties/:id  (agent, owner only)
async function updateProperty(req, res) {
  // Filtering by owner means another agent's listing is simply "not found".
  const property = await Property.findOne({ _id: req.params.id, owner: req.user._id });
  if (!property) throw httpError(404, 'Property not found');

  Object.assign(property, pickFields(req.body, EDITABLE_FIELDS));
  await property.save();

  res.json({ property });
}

// DELETE /api/properties/:id  (agent, owner only)
async function deleteProperty(req, res) {
  const property = await Property.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!property) throw httpError(404, 'Property not found');

  // Remove activity that pointed at the deleted listing.
  await Promise.all([
    Inquiry.deleteMany({ property: property._id }),
    Review.deleteMany({ property: property._id }),
    Appointment.deleteMany({ property: property._id }),
  ]);

  res.json({ message: 'Property deleted', id: property._id });
}

module.exports = {
  getProperties,
  getMyProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};
