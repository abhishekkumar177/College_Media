const mongoose = require('mongoose');

const resumeReviewSchema = new mongoose.Schema({
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  suggestions: [String]
}, { timestamps: true });

module.exports = mongoose.model('ResumeReview', resumeReviewSchema);