const express = require('express');
const router = express.Router();
const LiveStream = require('../models/LiveStream');
const liveStreamService = require('../services/liveStreamService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

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
 * /api/live/create:
 *   post:
 *     summary: Initialize a live stream
 *     tags: [Live Streaming]
 */
router.post('/create', verifyToken, async (req, res) => {
    try {
        const { title } = req.body;
        const streamKey = liveStreamService.generateStreamKey();

        const stream = await LiveStream.create({
            user: req.userId,
            title: title || 'Untitled Stream',
            streamKey,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            streamKey,
            rtmpUrl: 'rtmp://localhost:1935/live',
            streamId: stream._id
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/live:
 *   get:
 *     summary: List active live streams
 *     tags: [Live Streaming]
 */
router.get('/', async (req, res) => {
    try {
        const streams = await LiveStream.find({ status: 'live' })
            .populate('user', 'username profilePicture')
            .sort({ startedAt: -1 });
        res.json({ success: true, streams });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/live/{id}:
 *   get:
 *     summary: Get stream details
 *     tags: [Live Streaming]
 */
router.get('/:id', async (req, res) => {
    try {
        const stream = await LiveStream.findById(req.params.id)
            .populate('user', 'username profilePicture');

        if (!stream) return res.status(404).json({ success: false, message: 'Stream not found' });

        res.json({ success: true, stream });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
