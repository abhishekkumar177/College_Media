const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const IPFSService = require('../services/ipfsService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

// Temporary local storage before IPFS push
const upload = multer({ dest: path.join(__dirname, '../uploads/temp') });

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

/**
 * @swagger
 * /api/storage/ipfs:
 *   post:
 *     summary: Upload file to IPFS Decentralized Storage
 *     tags: [Storage]
 */
router.post('/ipfs', verifyToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Upload to IPFS
        const cid = await IPFSService.uploadFile(req.file.path);
        const url = IPFSService.getGatewayUrl(cid);

        // Cleanup local temp file
        try {
            fs.unlinkSync(req.file.path);
        } catch (e) {
            console.error('Failed to cleanup temp file:', e);
        }

        res.json({
            success: true,
            message: 'File added to IPFS',
            cid,
            url
        });

    } catch (error) {
        // Cleanup if error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
