const Product = require('../models/Product');
const Order = require('../models/Order');
const logger = require('../utils/logger');

/**
 * @desc    Get all marketplace products
 * @route   GET /api/marketplace/products
 * @access  Public
 */
exports.getProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search, sort } = req.query;
        let query = { status: 'Available' };

        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (search) {
            query.$text = { $search: search };
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'priceLow') sortOption = { price: 1 };
        if (sort === 'priceHigh') sortOption = { price: -1 };

        const products = await Product.find(query)
            .populate('seller', 'username firstName lastName profilePicture')
            .sort(sortOption);

        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        logger.error('Get products error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get single product
 * @route   GET /api/marketplace/products/:id
 * @access  Public
 */
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'username firstName lastName profilePicture');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Create new product listing
 * @route   POST /api/marketplace/products
 * @access  Private
 */
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create({
            ...req.body,
            seller: req.user.id
        });

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Update product listing
 * @route   PUT /api/marketplace/products/:id
 * @access  Private
 */
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (product.seller.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this listing' });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Delete product listing
 * @route   DELETE /api/marketplace/products/:id
 * @access  Private
 */
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (product.seller.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this listing' });
        }

        await product.deleteOne();

        res.status(200).json({ success: true, message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Create order (initiate payment)
 * @route   POST /api/marketplace/orders
 * @access  Private
 */
exports.createOrder = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (product.status !== 'Available') {
            return res.status(400).json({ success: false, message: 'Product is not available' });
        }

        if (product.seller.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot buy your own product' });
        }

        const order = await Order.create({
            buyer: req.user.id,
            seller: product.seller,
            product: productId,
            amount: product.price
        });

        // Update product status to pending
        product.status = 'Pending';
        await product.save();

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get user's buy/sell orders
 * @route   GET /api/marketplace/orders
 * @access  Private
 */
exports.getOrders = async (req, res) => {
    try {
        const buyOrders = await Order.find({ buyer: req.user.id }).populate('product product.seller');
        const sellOrders = await Order.find({ seller: req.user.id }).populate('product product.buyer');

        res.status(200).json({ success: true, buyOrders, sellOrders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
