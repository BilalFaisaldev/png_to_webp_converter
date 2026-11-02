const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    default: null,
    sparse: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    lowercase: true,
    minlength: [2, 'Username must be at least 2 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    default: null
  },
  apiKey: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'pro', 'business'],
    default: 'user'
  },
  credits: {
    type: Number,
    default: 50
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  otpCode: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
