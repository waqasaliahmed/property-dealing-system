const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // Auto-delete expired sessions after 7 days
      expires: 604800,
    },
  },
  { timestamps: true }
);

// Index to remove expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Session', sessionSchema);
