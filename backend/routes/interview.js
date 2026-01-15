const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const InterviewSession = require('../models/InterviewSession');
const InterviewCoachService = require('../services/interviewCoach');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

// Ensure dir exists
const uploadDir = path.join(__dirname, '../uploads/interviews');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

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
 * /api/interview/upload:
 *   post:
 *     summary: Upload interview answer video for analysis
 */
router.post('/upload', verifyToken, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No video uploaded' });

        const { question } = req.body;

        const session = await InterviewSession.create({
            user: req.userId,
            question: question || 'Self Introduction',
            videoUrl: `/uploads/interviews/${req.file.filename}`,
            status: 'processing'
        });

        // Trigger Async Processing
        InterviewCoachService.processInterview(session._id, req.file.path);

        res.json({
            success: true,
            message: 'Video upload successful. Analysis stuck.',
            sessionId: session._id
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/interview/:id:
 *   get:
 *     summary: Get interview analysis results
 */
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const session = await InterviewSession.findById(req.params.id);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        // Check ownership
        if (session.user.toString() !== req.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        res.json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
