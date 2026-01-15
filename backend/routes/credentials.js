const express = require('express');
const router = express.Router();
const web3Service = require('../services/web3Service');
const jwt = require('jsonwebtoken');
const { checkPermission, PERMISSIONS } = require('../middleware/rbacMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

// Auth middleware
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

/**
 * @swagger
 * /api/credentials/mint:
 *   post:
 *     summary: Mint a new certificate NFT (Admin only)
 *     tags: [Credentials]
 */
router.post('/mint', verifyToken, checkPermission(PERMISSIONS.MANAGE_USERS), async (req, res) => {
    try {
        const { recipientAddress, certificateType, metadata } = req.body;

        if (!recipientAddress || !certificateType) {
            return res.status(400).json({
                success: false,
                message: 'Missing recipientAddress or certificateType'
            });
        }

        // Validate certificate type
        const validTypes = ['EVENT_ATTENDANCE', 'COURSE_COMPLETION', 'ACHIEVEMENT_BADGE', 'HONOR_ROLL'];
        if (!validTypes.includes(certificateType)) {
            return res.status(400).json({
                success: false,
                message: `Invalid type. Must be one of: ${validTypes.join(', ')}`
            });
        }

        const result = await web3Service.mintCertificate(
            recipientAddress,
            certificateType,
            metadata || {}
        );

        res.status(201).json({
            success: true,
            message: 'Certificate minted successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/credentials/verify/{address}:
 *   get:
 *     summary: Verify if address has a specific certificate type
 *     tags: [Credentials]
 */
router.get('/verify/:address', verifyToken, async (req, res) => {
    try {
        const { address } = req.params;
        const { type } = req.query;

        if (!type) {
            return res.status(400).json({ success: false, message: 'Missing type query param' });
        }

        const result = await web3Service.verifyCertificate(address, type);

        res.json({
            success: true,
            address,
            certificateType: type,
            ...result
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/credentials/user/{address}:
 *   get:
 *     summary: Get all certificates for a wallet address
 *     tags: [Credentials]
 */
router.get('/user/:address', verifyToken, async (req, res) => {
    try {
        const { address } = req.params;
        const result = await web3Service.getUserCertificates(address);

        res.json({
            success: true,
            address,
            ...result
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
