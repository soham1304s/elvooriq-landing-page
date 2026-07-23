const mongoose = require('mongoose');

const authenticationSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  flowType: {
    type: String,
    enum: ['login', 'register'],
    required: true
  },
  currentStep: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'failed', 'abandoned'],
    default: 'active'
  }
}, { timestamps: true });

// TTL Index - Sessions expire after 1 hour of inactivity
authenticationSessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('AuthenticationSession', authenticationSessionSchema);
