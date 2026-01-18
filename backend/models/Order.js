const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Delivered', 'Completed', 'Cancelled', 'Refunded'],
        default: 'Pending'
    },
    paymentIntentId: {
        type: String // Stripe Payment Intent ID
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Succeeded', 'Failed', 'RequiresAction'],
        default: 'Pending'
    },
    escrowStatus: {
        type: String,
        enum: ['Held', 'Released', 'Refunded', 'N/A'],
        default: 'N/A'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
