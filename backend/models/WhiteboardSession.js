const mongoose = require('mongoose');

const whiteboardSessionSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    topic: {
        type: String,
        default: 'Study Session'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        joinedAt: { type: Date, default: Date.now },
        isDrawing: { type: Boolean, default: false }
    }],
    // Current board state (elements saved in real-time)
    canvasData: [{
        id: String,
        type: { type: String, enum: ['pencil', 'rect', 'circle', 'text', 'line'] },
        points: [Number], // For pencil/path
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        fill: String,
        stroke: String,
        strokeWidth: Number,
        text: String,
        rotation: { type: Number, default: 0 }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 24 * 60 * 60 * 1000) // 24h default
    }
}, { timestamps: true });

module.exports = mongoose.model('WhiteboardSession', whiteboardSessionSchema);
