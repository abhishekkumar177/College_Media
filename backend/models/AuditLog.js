const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true, // e.g. 'CREATE', 'UPDATE', 'DELETE'
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PERMISSION_CHANGE', 'BAN']
  },
  resourceType: {
    type: String,
    required: true,
    index: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed, // Previous State
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed, // New State
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed // Extra context
  },
  ip: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE'],
    default: 'SUCCESS'
  }
}, {
  timestamps: true // createdAt is the event time
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
