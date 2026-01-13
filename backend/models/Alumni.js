const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  graduationYear: {
    type: Number,
    required: true
  },
  degree: {
    type: String,
    required: true
  },
  major: {
    type: String,
    required: true
  },
  minor: {
    type: String
  },
  currentCompany: {
    type: String
  },
  currentPosition: {
    type: String
  },
  industry: {
    type: String
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  bio: {
    type: String,
    maxlength: 500
  },
  skills: [{
    type: String
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date
  }],
  workExperience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String
  }],
  linkedin: {
    type: String
  },
  twitter: {
    type: String
  },
  github: {
    type: String
  },
  website: {
    type: String
  },
  mentorshipAvailable: {
    type: Boolean,
    default: false
  },
  mentorshipAreas: [{
    type: String
  }],
  lookingForOpportunities: {
    type: Boolean,
    default: false
  },
  willingToHire: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  visibility: {
    type: String,
    enum: ['public', 'alumni-only', 'private'],
    default: 'alumni-only'
  }
}, {
  timestamps: true
});

// Index for efficient searches
alumniSchema.index({ graduationYear: 1 });
alumniSchema.index({ major: 1 });
alumniSchema.index({ currentCompany: 1 });
alumniSchema.index({ 'location.city': 1, 'location.country': 1 });
alumniSchema.index({ skills: 1 });

module.exports = mongoose.model('Alumni', alumniSchema);
