const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const marketplaceController = require('../controllers/marketplaceController');

// Product Routes
router.get('/products', marketplaceController.getProducts);
router.get('/products/:id', marketplaceController.getProduct);
router.post('/products', protect, marketplaceController.createProduct);
router.put('/products/:id', protect, marketplaceController.updateProduct);
router.delete('/products/:id', protect, marketplaceController.deleteProduct);

// Order Routes
router.post('/orders', protect, marketplaceController.createOrder);
router.get('/orders', protect, marketplaceController.getOrders);

module.exports = router;
