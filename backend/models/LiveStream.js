const mongoose = require('mongoose');

const liveStreamSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    streamKey: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'live', 'ended'],
        default: 'pending',
        index: true
    },
    viewers: {
        type: Number,
        default: 0
    },
    playbackUrl: {
        type: String // HLS URL
    },
    thumbnailUrl: {
        type: String
    },
    startedAt: Date,
    endedAt: Date,
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LiveStream', liveStreamSchema);
