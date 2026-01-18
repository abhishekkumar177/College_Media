const Stripe = require('stripe');
const Product = require('../models/Product');
const Order = require('../models/Order');
const logger = require('../utils/logger');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

class PaymentController {
    /**
     * Create Payment Intent for a Product
     * Uses Escrow-style: Money is captured but held until delivery confirmation
     */
    static async createPaymentIntent(req, res) {
        try {
            const { productId } = req.body;
            const product = await Product.findById(productId);

            if (!product || product.status !== 'Available') {
                return res.status(404).json({ success: false, message: 'Product unavailable' });
            }

            // Calculate amounts
            const amount = Math.round(product.price * 100); // in cents for Stripe

            // Create PaymentIntent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'inr',
                metadata: {
                    productId: product._id.toString(),
                    buyerId: req.user.id,
                    sellerId: product.seller.toString()
                },
                automatic_payment_methods: { enabled: true },
            });

            // Create Order record
            const order = await Order.create({
                buyer: req.user.id,
                seller: product.seller,
                product: product._id,
                amount: product.price,
                paymentIntentId: paymentIntent.id,
                status: 'Pending',
                escrowStatus: 'Held'
            });

            res.json({
                success: true,
                clientSecret: paymentIntent.client_secret,
                orderId: order._id
            });

        } catch (error) {
            logger.error('Payment intent creation failed:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Confirm Delivery & Release Funds
     * Marks order as completed
     */
    static async confirmDelivery(req, res) {
        try {
            const { orderId } = req.params;
            const order = await Order.findById(orderId);

            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            // Only buyer can confirm delivery
            if (order.buyer.toString() !== req.user.id) {
                return res.status(401).json({ success: false, message: 'Only buyer can confirm delivery' });
            }

            order.status = 'Completed';
            order.escrowStatus = 'Released';
            await order.save();

            // Mark product as sold officially
            await Product.findByIdAndUpdate(order.product, { status: 'Sold' });

            res.json({ success: true, message: 'Delivery confirmed and funds released' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Stripe Webhook Handler
     */
    static async handleWebhook(req, res) {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;
        try {
            event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, endpointSecret);
        } catch (err) {
            // Mock for dev
            if (!endpointSecret) {
                event = req.body;
            } else {
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }
        }

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            await Order.findOneAndUpdate(
                { paymentIntentId: paymentIntent.id },
                { status: 'Paid', paymentStatus: 'Succeeded' }
            );
        }

        res.json({ received: true });
    }
}

module.exports = PaymentController;
