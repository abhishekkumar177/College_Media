const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 5000
    },
    images: [{
        url: String,
        publicId: String // For Cloudinary deletion
    }],
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    likesCount: {
        type: Number,
        default: 0
    },
    comments: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: {
            type: String,
            maxlength: 1000
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    commentsCount: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    },
    visibility: {
        type: String,
        enum: ['public', 'followers', 'private'],
        default: 'public'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Update counts when likes/comments change
postSchema.methods.updateCounts = async function () {
    this.likesCount = this.likes.length;
    this.commentsCount = this.comments.length;
    return this.save();
};

// Indexes for query optimization
postSchema.index({ author: 1, createdAt: -1 }); // User's posts sorted by date
postSchema.index({ createdAt: -1 }); // Recent posts
postSchema.index({ likesCount: -1 }); // Popular posts
postSchema.index({ tags: 1 }); // Search by tag
postSchema.index({ visibility: 1, isDeleted: 1 }); // Public non-deleted posts
postSchema.index({ isDeleted: 1, createdAt: -1 }); // Active posts sorted

// Text index for full-text search
postSchema.index({
    content: 'text',
    tags: 'text'
}, {
    weights: {
        tags: 10,
        content: 5
    },
    name: 'post_text_search'
});

module.exports = mongoose.model('Post', postSchema);
