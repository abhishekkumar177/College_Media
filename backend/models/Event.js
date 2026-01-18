const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    bannerUrl: String,
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String, // E.g., "Auditorium", "Online"
        required: true
    },
    category: {
        type: String,
        enum: ['Fest', 'Workshop', 'Seminar', 'Concert', 'Competition', 'Other'],
        default: 'Other'
    },
    visibility: {
        type: String,
        enum: ['Public', 'College-Only', 'Private'],
        default: 'Public'
    },
    ticketTiers: [{
        name: { type: String, required: true }, // e.g., "Early Bird", "VIP"
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        sold: { type: Number, default: 0 }
    }],
    tags: [String],
    aiRiskScore: {
        type: Number, // 0-100, predicted crowd density risk
        default: 0
    },
    expectedAttendance: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ date: 1 });

module.exports = mongoose.model('Event', eventSchema);
