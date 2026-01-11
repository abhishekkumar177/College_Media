const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'alumni', 'admin'],
    default: 'student'
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  alumniDetails: {
    company: { type: String, trim: true },
    designation: { type: String, trim: true },
    industry: { type: String, trim: true },
    graduationYear: { type: Number },
    linkedinProfile: { type: String, trim: true },
    isOpenToMentorship: { type: Boolean, default: true }
  },
  profilePicture: {
    type: String,
    default: null
  },
  profileBanner: {
    type: String,
    default: null
  },
  followerCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  notificationSettings: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    likes: {
      type: Boolean,
      default: true
    },
    comments: {
      type: Boolean,
      default: true
    },
    follows: {
      type: Boolean,
      default: true
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletionReason: {
    type: String,
    default: null
  },
  scheduledDeletionDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Method to soft delete user account
userSchema.methods.softDelete = async function(reason = null) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletionReason = reason;
  this.isActive = false;
  // Schedule permanent deletion after 30 days
  this.scheduledDeletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return this.save();
};

// Method to restore deleted account
userSchema.methods.restore = async function() {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletionReason = null;
  this.scheduledDeletionDate = null;
  this.isActive = true;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);