const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  attachmentUrl: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  conversationId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });

// Static method to generate conversation ID (consistent for both users)
messageSchema.statics.generateConversationId = function(userId1, userId2) {
  const ids = [userId1.toString(), userId2.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
};

// Instance method to mark as read
messageSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Virtual for checking if deleted for specific user
messageSchema.methods.isDeletedForUser = function(userId) {
  return this.deletedBy.some(id => id.toString() === userId.toString());
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
