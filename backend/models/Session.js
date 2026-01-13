const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  ipAddress: String,
  userAgent: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model("Session", sessionSchema);
