const express = require('express');
const router = express.Router();
const Credential = require('../models/Credential');
const blockchainService = require('../services/blockchainService');
const { protect } = require('../middleware/authMiddleware');

// Get My Credentials
router.get('/my', protect, async (req, res) => {
    try {
        const credentials = await Credential.find({ recipient: req.user.id });
        res.json({ success: true, data: credentials });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Issue Credential (Admin/System Only - simplified for demo)
router.post('/issue', protect, async (req, res) => {
    try {
        const { title, description, type, metadata } = req.body;

        // Generate Merkle Proof
        const proofData = blockchainService.issueCredential({
            recipient: req.user.id,
            title,
            timestamp: Date.now()
        });

        const credential = await Credential.create({
            recipient: req.user.id,
            title,
            description,
            type,
            metadata,
            proof: {
                root: proofData.root,
                targetHash: proofData.targetHash,
                path: proofData.proof
            }
        });

        // Set Verification URL
        credential.verificationUrl = `${req.protocol}://${req.get('host')}/verify/${credential._id}`;
        await credential.save();

        res.status(201).json({ success: true, data: credential });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Verify Credential (Public)
router.get('/verify/:id', async (req, res) => {
    try {
        const credential = await Credential.findById(req.params.id).populate('recipient', 'username');
        if (!credential) return res.status(404).json({ success: false, message: 'Invalid Credential ID' });

        res.json({ success: true, valid: true, data: credential });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Download PDF
router.get('/:id/download', protect, async (req, res) => {
    try {
        const credential = await Credential.findById(req.params.id).populate('recipient', 'username');
        if (!credential) return res.status(404).json({ message: 'Not Found' });

        const pdfBuffer = await blockchainService.generatePDF(credential, credential.recipient);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="certificate-${credential._id}.pdf"`,
            'Content-Length': pdfBuffer.length
        });
        res.send(pdfBuffer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
