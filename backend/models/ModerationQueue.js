/**
 * ModerationQueue Model
 * Issue #901: Content Moderation System with AI-Assisted Detection
 * 
 * Stores content items pending moderation review with priority scoring.
 */

const mongoose = require('mongoose');

const moderationQueueSchema = new mongoose.Schema({
  // Reference to the content being moderated
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'contentType'
  },
  contentType: {
    type: String,
    required: true,
    enum: ['Post', 'Comment', 'Message', 'Profile']
  },
  
  // User who created the content
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Content snapshot (in case original is modified)
  contentSnapshot: {
    text: String,
    imageUrls: [String],
    videoUrls: [String]
  },
  
  // AI Analysis Results
  aiAnalysis: {
    profanityScore: { type: Number, default: 0, min: 0, max: 1 },
    spamScore: { type: Number, default: 0, min: 0, max: 1 },
    hateSpeechScore: { type: Number, default: 0, min: 0, max: 1 },
    toxicityScore: { type: Number, default: 0, min: 0, max: 1 },
    nsfwScore: { type: Number, default: 0, min: 0, max: 1 },
    overallConfidence: { type: Number, default: 0, min: 0, max: 1 },
    detectedCategories: [String],
    flaggedPhrases: [String],
    analyzedAt: Date
  },
  
  // Priority System (1 = highest, 10 = lowest)
  priority: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },
  
  // Queue Status
  status: {
    type: String,
    enum: ['pending', 'in_review', 'approved', 'rejected', 'escalated'],
    default: 'pending'
  },
  
  // Flags/Reports from users
  reports: [{
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    category: {
      type: String,
      enum: ['spam', 'harassment', 'hate_speech', 'violence', 'nsfw', 'misinformation', 'other']
    },
    reportedAt: { type: Date, default: Date.now }
  }],
  reportCount: { type: Number, default: 0 },
  
  // Assigned moderator
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  
  // Moderation decision
  decision: {
    action: {
      type: String,
      enum: ['approve', 'warn', 'hide', 'remove', 'ban_user']
    },
    reason: String,
    moderatorNotes: String,
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    decidedAt: Date
  },
  
  // Auto-moderation flags
  autoModerated: { type: Boolean, default: false },
  autoModerationRule: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for efficient querying
moderationQueueSchema.index({ status: 1, priority: 1, createdAt: 1 });
moderationQueueSchema.index({ userId: 1 });
moderationQueueSchema.index({ assignedTo: 1, status: 1 });
moderationQueueSchema.index({ 'aiAnalysis.overallConfidence': -1 });

// Calculate priority based on various factors
moderationQueueSchema.methods.calculatePriority = function() {
  let priority = 5; // Default medium priority
  
  // Higher AI confidence = higher priority (lower number)
  if (this.aiAnalysis.overallConfidence > 0.9) priority = 1;
  else if (this.aiAnalysis.overallConfidence > 0.7) priority = 2;
  else if (this.aiAnalysis.overallConfidence > 0.5) priority = 3;
  
  // More reports = higher priority
  if (this.reportCount >= 10) priority = Math.min(priority, 1);
  else if (this.reportCount >= 5) priority = Math.min(priority, 2);
  else if (this.reportCount >= 3) priority = Math.min(priority, 3);
  
  // Hate speech and violence get highest priority
  if (this.aiAnalysis.hateSpeechScore > 0.7 || this.aiAnalysis.detectedCategories?.includes('violence')) {
    priority = 1;
  }
  
  this.priority = priority;
  return priority;
};

// Static method to get queue items for moderator
moderationQueueSchema.statics.getQueueForModerator = function(moderatorId, limit = 20) {
  return this.find({
    status: 'pending',
    $or: [
      { assignedTo: null },
      { assignedTo: moderatorId }
    ]
  })
  .sort({ priority: 1, createdAt: 1 })
  .limit(limit)
  .populate('userId', 'username avatar')
  .lean();
};

const ModerationQueue = mongoose.model('ModerationQueue', moderationQueueSchema);

module.exports = ModerationQueue;
