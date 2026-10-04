// Run with: npm run seed
// Creates demo agents, buyers, properties and reviews. It only removes earlier
// demo data (matched by the demo emails), so real users are never touched.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Agent = require('../models/Agent');
const Property = require('../models/Property');
const Review = require('../models/Review');
const Inquiry = require('../models/Inquiry');
const Appointment = require('../models/Appointment');
const { demoAgents, demoBuyers, properties, reviews } = require('./seedData');

const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || 'password123';

async function removeOldDemoData() {
  const emails = [...demoAgents, ...demoBuyers].map((user) => user.email);
  const userIds = (await User.find({ email: { $in: emails } })).map((user) => user._id);
  const propertyIds = (await Property.find({ owner: { $in: userIds } })).map((p) => p._id);
  const participant = { $or: [{ buyer: { $in: userIds } }, { agent: { $in: userIds } }] };

  await Promise.all([
    Review.deleteMany({ $or: [{ author: { $in: userIds } }, { property: { $in: propertyIds } }] }),
    Inquiry.deleteMany(participant),
    Appointment.deleteMany(participant),
    Agent.deleteMany({ user: { $in: userIds } }),
    Property.deleteMany({ owner: { $in: userIds } }),
  ]);
  await User.deleteMany({ _id: { $in: userIds } });
}

async function seed() {
  await connectDB();
  await removeOldDemoData();

  // User.create runs the pre-save hook, so demo passwords are hashed too.
  const agentUsers = await User.create(
    demoAgents.map(({ name, email }) => ({ name, email, password: DEMO_PASSWORD, role: 'agent' }))
  );
  const buyerUsers = await User.create(
    demoBuyers.map(({ name, email }) => ({ name, email, password: DEMO_PASSWORD, role: 'buyer' }))
  );

  const agentProfiles = await Agent.create(
    demoAgents.map((agent, index) => ({ ...agent.profile, user: agentUsers[index]._id }))
  );

  const createdProperties = await Property.create(
    properties.map(({ agentIndex, ...property }) => ({
      ...property,
      owner: agentUsers[agentIndex]._id,
      agent: agentProfiles[agentIndex]._id,
    }))
  );

  await Review.create(
    reviews.map(({ buyerIndex, propertyIndex, rating, comment }) => ({
      author: buyerUsers[buyerIndex]._id,
      property: createdProperties[propertyIndex]._id,
      rating,
      comment,
    }))
  );

  console.log(
    `Seeded ${agentUsers.length} agents, ${buyerUsers.length} buyers, ` +
      `${createdProperties.length} properties and ${reviews.length} reviews.`
  );
}

seed()
  .catch((error) => {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
