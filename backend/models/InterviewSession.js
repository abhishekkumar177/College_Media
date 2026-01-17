const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
    booth: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CareerBooth',
        required: true
    },
    interviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: Date,
    feedback: {
        technicalScore: { type: Number, min: 1, max: 10 },
        communicationScore: { type: Number, min: 1, max: 10 },
        notes: String,
        decision: {
            type: String,
            enum: ['Shortlisted', 'Rejected', 'OnHold'],
            default: 'OnHold'
        }
    },
    status: {
        type: String,
        enum: ['Live', 'Completed', 'Cancelled'],
        default: 'Live'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
