const jwt = require('jsonwebtoken');
const User = require('../models/User');
const httpError = require('../utils/httpError');

const TOKEN_EXPIRY = '7d';

function createToken(user) {
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

// The only user fields the frontend ever receives. Never the password hash.
function toPublicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

// POST /api/auth/register
async function register(req, res) {
  const { name, email, password, role } = req.body || {};

  if (!name || !email || !password) {
    throw httpError(400, 'Name, email and password are required');
  }
  if (role !== undefined && !User.ROLES.includes(role)) {
    throw httpError(400, 'Role must be buyer or agent');
  }

  // String() stops objects like { "$gt": "" } from being used as a query.
  const existingUser = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existingUser) {
    throw httpError(409, 'Email is already registered');
  }

  // Password hashing happens in the User model's pre-save hook.
  const user = await User.create({
    name: String(name),
    email: String(email),
    password: String(password),
    role,
  });

  res.status(201).json({ user: toPublicUser(user), token: createToken(user) });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw httpError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  const passwordMatches = user ? await user.matchPassword(String(password)) : false;

  // Same message for unknown email and wrong password, so nobody can probe which emails exist.
  if (!passwordMatches) {
    throw httpError(401, 'Invalid email or password');
  }

  res.json({ user: toPublicUser(user), role: user.role, token: createToken(user) });
}

// GET /api/auth/me  (protected) - lets the frontend confirm a saved token is still valid.
async function getMe(req, res) {
  res.json({ user: toPublicUser(req.user) });
}

module.exports = { register, login, getMe };
