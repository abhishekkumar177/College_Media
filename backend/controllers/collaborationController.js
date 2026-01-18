/**
 * Collaboration Controller
 * Issue #923: Real-time Collaborative Features
 * 
 * API endpoints for collaborative features.
 */

const collaborationService = require('../services/collaborationService');
const presenceService = require('../services/presenceService');
const CollaborativeDocument = require('../models/CollaborativeDocument');

const collaborationController = {

    /**
     * POST /api/collaboration/sessions
     * Create new collaborative session
     */
    async createSession(req, res) {
        try {
            const { documentId, documentType, settings } = req.body;
            const ownerId = req.user._id;

            const session = await collaborationService.createSession({
                documentId,
                documentType,
                ownerId,
                settings
            });

            res.status(201).json({
                success: true,
                data: session
            });
        } catch (error) {
            console.error('Create session error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * POST /api/collaboration/sessions/:sessionId/join
     * Join collaborative session
     */
    async joinSession(req, res) {
        try {
            const { sessionId } = req.params;
            const { role = 'viewer' } = req.body;
            const userId = req.user._id;

            const session = await collaborationService.joinSession(sessionId, userId, role);

            // Update presence
            presenceService.joinSession(sessionId, userId.toString());

            res.json({
                success: true,
                data: session
            });
        } catch (error) {
            console.error('Join session error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * POST /api/collaboration/sessions/:sessionId/leave
     * Leave collaborative session
     */
    async leaveSession(req, res) {
        try {
            const { sessionId } = req.params;
            const userId = req.user._id;

            const session = await collaborationService.leaveSession(sessionId, userId);

            // Update presence
            presenceService.leaveSession(sessionId, userId.toString());

            res.json({
                success: true,
                data: session
            });
        } catch (error) {
            console.error('Leave session error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * POST /api/collaboration/sessions/:sessionId/operations
     * Apply operation to document
     */
    async applyOperation(req, res) {
        try {
            const { sessionId } = req.params;
            const { operation } = req.body;
            const userId = req.user._id;

            const result = await collaborationService.applyOperation(
                sessionId,
                userId,
                operation
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Apply operation error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * GET /api/collaboration/sessions/:sessionId
     * Get session state
     */
    async getSessionState(req, res) {
        try {
            const { sessionId } = req.params;

            const state = await collaborationService.getSessionState(sessionId);

            res.json({
                success: true,
                data: state
            });
        } catch (error) {
            console.error('Get session state error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * GET /api/collaboration/sessions/:sessionId/history
     * Get session operation history
     */
    async getSessionHistory(req, res) {
        try {
            const { sessionId } = req.params;
            const { limit = 100 } = req.query;

            const history = await collaborationService.getSessionHistory(
                sessionId,
                parseInt(limit)
            );

            res.json({
                success: true,
                data: history
            });
        } catch (error) {
            console.error('Get session history error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * POST /api/collaboration/sessions/:sessionId/snapshot
     * Create document snapshot
     */
    async createSnapshot(req, res) {
        try {
            const { sessionId } = req.params;
            const userId = req.user._id;

            const document = await collaborationService.createSnapshot(sessionId, userId);

            res.json({
                success: true,
                data: document
            });
        } catch (error) {
            console.error('Create snapshot error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * DELETE /api/collaboration/sessions/:sessionId
     * End collaborative session
     */
    async endSession(req, res) {
        try {
            const { sessionId } = req.params;
            const userId = req.user._id;

            const session = await collaborationService.endSession(sessionId, userId);

            res.json({
                success: true,
                data: session
            });
        } catch (error) {
            console.error('End session error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * GET /api/collaboration/sessions
     * Get user sessions
     */
    async getUserSessions(req, res) {
        try {
            const userId = req.user._id;
            const { status = 'active' } = req.query;

            const sessions = await collaborationService.getUserSessions(userId, status);

            res.json({
                success: true,
                data: sessions
            });
        } catch (error) {
            console.error('Get user sessions error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * GET /api/collaboration/sessions/:sessionId/statistics
     * Get session statistics
     */
    async getSessionStatistics(req, res) {
        try {
            const { sessionId } = req.params;

            const stats = await collaborationService.getSessionStatistics(sessionId);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Get session statistics error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * GET /api/collaboration/sessions/:sessionId/presence
     * Get session presence
     */
    async getSessionPresence(req, res) {
        try {
            const { sessionId } = req.params;

            const presence = presenceService.getSessionPresence(sessionId);

            res.json({
                success: true,
                data: presence
            });
        } catch (error) {
            console.error('Get session presence error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * POST /api/collaboration/documents
     * Create collaborative document
     */
    async createDocument(req, res) {
        try {
            const { type, content, metadata, permissions } = req.body;
            const ownerId = req.user._id;

            const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const document = await CollaborativeDocument.create({
                documentId,
                type,
                ownerId,
                content,
                metadata,
                permissions
            });

            res.status(201).json({
                success: true,
                data: document
            });
        } catch (error) {
            console.error('Create document error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * GET /api/collaboration/documents/:documentId
     * Get collaborative document
     */
    async getDocument(req, res) {
        try {
            const { documentId } = req.params;

            const document = await CollaborativeDocument.findOne({ documentId });

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found'
                });
            }

            res.json({
                success: true,
                data: document
            });
        } catch (error) {
            console.error('Get document error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = collaborationController;
