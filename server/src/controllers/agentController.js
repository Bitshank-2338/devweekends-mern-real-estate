const Agent = require('../models/Agent');
const Property = require('../models/Property');
const httpError = require('../utils/httpError');
const pickFields = require('../utils/pickFields');

const EDITABLE_FIELDS = ['agency', 'phone', 'city', 'bio', 'experienceYears', 'specialties'];

// Counts listings per agent profile, e.g. { "<agentId>": 4 }.
async function countListingsByAgent() {
  const groups = await Property.aggregate([{ $group: { _id: '$agent', count: { $sum: 1 } } }]);
  return Object.fromEntries(groups.map((group) => [String(group._id), group.count]));
}

// GET /api/agents  (public)
async function getAgents(req, res) {
  const limit = Math.min(Number(req.query.limit) || 50, 50);

  const [agents, listingCounts] = await Promise.all([
    Agent.find().sort({ experienceYears: -1 }).limit(limit).populate('user', 'name email'),
    countListingsByAgent(),
  ]);

  const agentsWithCounts = agents.map((agent) => ({
    ...agent.toObject(),
    listingCount: listingCounts[String(agent._id)] || 0,
  }));

  res.json({ count: agentsWithCounts.length, agents: agentsWithCounts });
}

// GET /api/agents/me  (agent) - the logged-in agent's own profile, or null if not created yet
async function getMyAgentProfile(req, res) {
  const agent = await Agent.findOne({ user: req.user._id }).populate('user', 'name email');
  res.json({ agent });
}

// GET /api/agents/:id  (public) - profile plus that agent's listings
async function getAgentById(req, res) {
  const agent = await Agent.findById(req.params.id).populate('user', 'name email');
  if (!agent) throw httpError(404, 'Agent not found');

  const properties = await Property.find({ owner: agent.user._id })
    .sort({ createdAt: -1 })
    .populate('owner', 'name');

  res.json({ agent, properties });
}

// POST /api/agents  (agent)
async function createAgentProfile(req, res) {
  const existing = await Agent.findOne({ user: req.user._id });
  if (existing) throw httpError(409, 'You already have an agent profile');

  const agent = await Agent.create({ ...pickFields(req.body, EDITABLE_FIELDS), user: req.user._id });

  // Show the new profile on listings the agent created before having one.
  await Property.updateMany({ owner: req.user._id }, { agent: agent._id });

  await agent.populate('user', 'name email');
  res.status(201).json({ agent });
}

// PUT /api/agents/:id  (agent, own profile only)
async function updateAgentProfile(req, res) {
  const agent = await Agent.findOne({ _id: req.params.id, user: req.user._id });
  if (!agent) throw httpError(404, 'Agent profile not found');

  Object.assign(agent, pickFields(req.body, EDITABLE_FIELDS));
  await agent.save();

  await agent.populate('user', 'name email');
  res.json({ agent });
}

// DELETE /api/agents/:id  (agent, own profile only)
async function deleteAgentProfile(req, res) {
  const agent = await Agent.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!agent) throw httpError(404, 'Agent profile not found');

  // Listings stay, they just no longer show a profile card.
  await Property.updateMany({ agent: agent._id }, { $unset: { agent: 1 } });

  res.json({ message: 'Agent profile deleted', id: agent._id });
}

module.exports = {
  getAgents,
  getMyAgentProfile,
  getAgentById,
  createAgentProfile,
  updateAgentProfile,
  deleteAgentProfile,
};
