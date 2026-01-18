const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tierName: {
        type: String,
        required: true
    },
    pricePaid: {
        type: Number,
        required: true
    },
    qrCode: {
        type: String, // Base64 encoded QR image or just the string data
        required: true
    },
    // The actual secure content encoded in the QR
    secureHash: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['Valid', 'Used', 'Cancelled'],
        default: 'Valid'
    },
    checkedInAt: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);
