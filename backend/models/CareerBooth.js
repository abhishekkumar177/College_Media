const mongoose = require('mongoose');

const careerBoothSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: String,
    logoUrl: String,
    rolesHiring: [String],
    status: {
        type: String,
        enum: ['Open', 'Closed', 'OnBreak'],
        default: 'Closed'
    },
    currentQueueLength: {
        type: Number,
        default: 0
    },
    // Simple FIFO queue modeled as array of User IDs for MVP
    queue: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        joinedAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('CareerBooth', careerBoothSchema);
