const mongoose = require('mongoose');

const alumniEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumni',
    required: true
  },
  eventType: {
    type: String,
    enum: ['networking', 'workshop', 'reunion', 'webinar', 'career-fair', 'social', 'other'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['virtual', 'physical', 'hybrid'],
      required: true
    },
    venue: String,
    address: String,
    city: String,
    state: String,
    country: String,
    virtualLink: String
  },
  capacity: {
    type: Number
  },
  attendees: [{
    alumni: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alumni'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    attended: {
      type: Boolean,
      default: false
    }
  }],
  tags: [{
    type: String
  }],
  imageUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  registrationDeadline: {
    type: Date
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
alumniEventSchema.index({ startDate: 1 });
alumniEventSchema.index({ eventType: 1 });
alumniEventSchema.index({ status: 1 });

module.exports = mongoose.model('AlumniEvent', alumniEventSchema);
