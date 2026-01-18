const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    slots: [{
        start: String, // e.g., "09:00"
        end: String,   // e.g., "10:00"
        isBooked: { type: Boolean, default: false }
    }]
});

const mentorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    bio: {
        type: String,
        required: true,
        maxlength: 1000
    },
    skills: [{
        type: String,
        required: true
    }],
    major: {
        type: String,
        required: true
    },
    yearOfGraduation: {
        type: Number,
        required: true
    },
    availability: [availabilitySchema],
    pricing: {
        isFree: { type: Boolean, default: true },
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'INR' }
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Add text index for searching skills and major
mentorProfileSchema.index({ skills: 'text', major: 'text', bio: 'text' });

module.exports = mongoose.model('MentorProfile', mentorProfileSchema);
