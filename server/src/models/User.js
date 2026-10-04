const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['buyer', 'agent'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name must be 60 characters or fewer'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      // Never returned by queries unless explicitly asked for with .select('+password').
      select: false,
    },
    role: {
      type: String,
      enum: { values: ROLES, message: 'Role must be buyer or agent' },
      default: 'buyer',
    },
  },
  { timestamps: true }
);

// Hash the password whenever it is set or changed, so plain text never reaches the database.
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function matchPassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.ROLES = ROLES;
