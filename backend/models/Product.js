const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        enum: ['Books', 'Electronics', 'Dorm Essentials', 'Clothing', 'Services', 'Other'],
        required: true
    },
    images: [{
        type: String
    }],
    condition: {
        type: String,
        enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
        required: true
    },
    status: {
        type: String,
        enum: ['Available', 'Pending', 'Sold'],
        default: 'Available'
    },
    location: {
        type: String, // College campus or area
        required: true
    }
}, { timestamps: true });

productSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
