const express = require('express');
const router = express.Router();
const multer = require('multer');
const AITutor = require('../services/aiTutor');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { protect } = require('../middleware/authMiddleware');
const matchController = require('../controllers/matchController');

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

// Multer for PDF uploads (in-memory)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Backward compatibility verifyToken for existing tutor logic
const verifyTokenCompat = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId || decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

/**
 * @swagger
 * /api/tutor/upload:
 *   post:
 *     summary: Upload and index a PDF document
 *     tags: [AI Tutor]
 */
router.post('/upload', verifyTokenCompat, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No PDF file provided' });
        }

        const result = await AITutor.indexDocument(
            req.file.buffer,
            req.file.originalname,
            req.userId
        );

        res.status(201).json({
            success: true,
            message: 'Document indexed successfully',
            data: result
        });
    } catch (error) {
        logger.error('Document upload failed:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/tutor/ask:
 *   post:
 *     summary: Ask a question (RAG)
 *     tags: [AI Tutor]
 */
router.post('/ask', verifyTokenCompat, async (req, res) => {
    try {
        const { question, documentId, stream } = req.body;

        if (!question) {
            return res.status(400).json({ success: false, message: 'Question is required' });
        }

        if (stream) {
            // Streaming response
            await AITutor.answerQuestion(question, req.userId, documentId, res);
        } else {
            // Standard response
            const result = await AITutor.answerQuestion(question, req.userId, documentId);
            res.json({ success: true, ...result });
        }
    } catch (error) {
        logger.error('Question answering failed:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/tutor/documents:
 *   get:
 *     summary: List user's indexed documents
 *     tags: [AI Tutor]
 */
router.get('/documents', verifyTokenCompat, async (req, res) => {
    try {
        const documents = await AITutor.getUserDocuments(req.userId);
        res.json({ success: true, documents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/tutor/documents/{documentId}:
 *   delete:
 *     summary: Delete a document
 *     tags: [AI Tutor]
 */
router.delete('/documents/:documentId', verifyTokenCompat, async (req, res) => {
    try {
        const deletedCount = await AITutor.deleteDocument(req.params.documentId, req.userId);
        res.json({ success: true, deletedChunks: deletedCount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/* ============================================================
   🎓 MENTORSHIP ROUTES
   ============================================================ */

/**
 * @desc    Mentor Profile Management
 */
router.post('/mentor/profile', protect, matchController.upsertMentorProfile);
router.get('/mentor/profile/me', protect, matchController.getMyMentorProfile);

/**
 * @desc    Find Mentor Matches
 */
router.get('/mentor/matches', protect, matchController.getMentorMatches);

/**
 * @desc    Get Mentor by ID & Booking
 */
router.get('/mentor/:id', protect, matchController.getMentorById);
router.post('/mentor/:id/book', protect, matchController.bookSession);

module.exports = router;
