const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  whatsapp: {
    type: String,
    trim: true
  },
  platform: {
    type: String,
    enum: ['Instagram', 'YouTube', 'Facebook', 'Kick', 'TikTok', 'Twitch', 'Custom'],
  },
  age: {
    type: Number
  },
  country: {
    type: String
  },
  experience: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Professional', 'Agency']
  },
  socialUrl: {
    type: String
  },
  bio: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'creator'],
    default: 'user'
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
