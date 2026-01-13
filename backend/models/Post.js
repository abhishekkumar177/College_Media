const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000,
    trim: true
  },
  postType: {
    type: String,
    enum: ['text', 'photo', 'video', 'poll', 'shared'],
    default: 'text'
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
    },
    url: {
      type: String,
      required: true
    },
    thumbnail: String,
    alt: String
  }],
  poll: {
    question: String,
    options: [{
      text: String,
      votes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        votedAt: {
          type: Date,
          default: Date.now
        }
      }]
    }],
    endsAt: Date,
    allowMultipleVotes: {
      type: Boolean,
      default: false
    }
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  sharesCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  sharedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  location: {
    name: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for checking if user liked the post
postSchema.virtual('isLiked').get(function() {
  return false; // Will be set in the route handler based on current user
});

// Method to toggle like
postSchema.methods.toggleLike = async function(userId) {
  const likeIndex = this.likes.findIndex(
    like => like.user.toString() === userId.toString()
  );

  if (likeIndex > -1) {
    // Unlike
    this.likes.splice(likeIndex, 1);
    this.likesCount = Math.max(0, this.likesCount - 1);
  } else {
    // Like
    this.likes.push({ user: userId });
    this.likesCount += 1;
  }

  return this.save();
};

// Method to increment comments count
postSchema.methods.incrementCommentsCount = async function() {
  this.commentsCount += 1;
  return this.save();
};

// Method to decrement comments count
postSchema.methods.decrementCommentsCount = async function() {
  this.commentsCount = Math.max(0, this.commentsCount - 1);
  return this.save();
};

// Method to increment shares count
postSchema.methods.incrementSharesCount = async function() {
  this.sharesCount += 1;
  return this.save();
};

// Method to increment views count
postSchema.methods.incrementViewsCount = async function() {
  this.viewsCount += 1;
  return this.save();
};

module.exports = mongoose.model('Post', postSchema);
