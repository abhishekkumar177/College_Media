const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    question: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String, // URL to the recorded answer
        required: true
    },
    transcript: {
        type: String
    },
    analysis: {
        confidenceScore: { type: Number, min: 0, max: 100 },
        sentiment: String, // 'Positive', 'Neutral', 'Negative'
        pace: String, // 'Too Fast', 'Good', 'Too Slow'
        feedback: String, // Detailed AI feedback
        emotions: {
            happy: Number,
            nervous: Number,
            neutral: Number
        }
    },
    status: {
        type: String,
        enum: ['processing', 'completed', 'failed'],
        default: 'processing'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
