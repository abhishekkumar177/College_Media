/**
 * Collaboration Service
 * Issue #923: Real-time Collaborative Features
 * 
 * Main service for managing collaborative sessions and operations.
 */

const CollaborativeSession = require('../models/CollaborativeSession');
const CollaborativeDocument = require('../models/CollaborativeDocument');
const operationalTransformService = require('./operationalTransformService');

class CollaborationService {

    /**
     * Create new collaborative session
     */
    async createSession(data) {
        const {
            documentId,
            documentType,
            ownerId,
            settings = {}
        } = data;

        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const session = await CollaborativeSession.create({
            sessionId,
            documentId,
            documentType,
            ownerId,
            settings,
            participants: [{
                userId: ownerId,
                role: 'owner',
                isActive: true
            }]
        });

        return session;
    }

    /**
     * Join existing session
     */
    async joinSession(sessionId, userId, role = 'viewer') {
        const session = await CollaborativeSession.findOne({ sessionId, status: 'active' });

        if (!session) {
            throw new Error('Session not found or inactive');
        }

        // Check if max participants reached
        const activeCount = session.getActiveParticipants().length;
        if (activeCount >= session.settings.maxParticipants) {
            throw new Error('Session is full');
        }

        await session.addParticipant(userId, role);

        return session;
    }

    /**
     * Leave session
     */
    async leaveSession(sessionId, userId) {
        const session = await CollaborativeSession.findOne({ sessionId });

        if (!session) {
            throw new Error('Session not found');
        }

        await session.removeParticipant(userId);

        // End session if owner leaves and no other participants
        if (session.ownerId.toString() === userId.toString()) {
            const activeParticipants = session.getActiveParticipants();
            if (activeParticipants.length === 0) {
                session.status = 'ended';
                session.endedAt = new Date();
                await session.save();
            }
        }

        return session;
    }

    /**
     * Apply operation to document
     */
    async applyOperation(sessionId, userId, operation) {
        const session = await CollaborativeSession.findOne({ sessionId, status: 'active' });

        if (!session) {
            throw new Error('Session not found or inactive');
        }

        // Check if user has permission
        const participant = session.participants.find(
            p => p.userId.toString() === userId.toString() && p.isActive
        );

        if (!participant) {
            throw new Error('User not in session');
        }

        if (!['owner', 'editor'].includes(participant.role)) {
            throw new Error('User does not have edit permission');
        }

        // Get document
        const document = await CollaborativeDocument.findOne({
            documentId: session.documentId.toString()
        });

        if (!document) {
            throw new Error('Document not found');
        }

        // Transform operation against pending operations
        const pendingOps = session.operationHistory
            .filter(op => op.version > operation.baseVersion)
            .map(op => op.operation);

        const transformedOp = operationalTransformService.transformAgainstOperations(
            operation,
            pendingOps
        );

        // Validate operation
        const currentText = typeof document.content === 'string'
            ? document.content
            : document.content.text || '';

        operationalTransformService.validateOperation(transformedOp, currentText.length);

        // Apply operation to document
        const newContent = operationalTransformService.applyOperation(currentText, transformedOp);

        // Update document
        await document.updateContent(newContent, userId);

        // Add operation to session history
        await session.addOperation(userId, transformedOp);

        return {
            session,
            document,
            operation: transformedOp,
            version: session.currentVersion
        };
    }

    /**
     * Update cursor position
     */
    async updateCursor(sessionId, userId, position, selection) {
        const session = await CollaborativeSession.findOne({ sessionId, status: 'active' });

        if (!session) {
            throw new Error('Session not found or inactive');
        }

        await session.updateCursor(userId, position, selection);

        return session;
    }

    /**
     * Get session state
     */
    async getSessionState(sessionId) {
        const session = await CollaborativeSession.findOne({ sessionId })
            .populate('participants.userId', 'username avatar')
            .lean();

        if (!session) {
            throw new Error('Session not found');
        }

        const document = await CollaborativeDocument.findOne({
            documentId: session.documentId.toString()
        });

        return {
            session,
            document,
            activeParticipants: session.participants.filter(p => p.isActive)
        };
    }

    /**
     * Create document snapshot
     */
    async createSnapshot(sessionId, userId) {
        const session = await CollaborativeSession.findOne({ sessionId });

        if (!session) {
            throw new Error('Session not found');
        }

        const document = await CollaborativeDocument.findOne({
            documentId: session.documentId.toString()
        });

        if (!document) {
            throw new Error('Document not found');
        }

        await document.createSnapshot(userId);

        return document;
    }

    /**
     * Get session history
     */
    async getSessionHistory(sessionId, limit = 100) {
        const session = await CollaborativeSession.findOne({ sessionId })
            .select('operationHistory')
            .lean();

        if (!session) {
            throw new Error('Session not found');
        }

        return session.operationHistory
            .slice(-limit)
            .reverse();
    }

    /**
     * End session
     */
    async endSession(sessionId, userId) {
        const session = await CollaborativeSession.findOne({ sessionId });

        if (!session) {
            throw new Error('Session not found');
        }

        // Only owner can end session
        if (session.ownerId.toString() !== userId.toString()) {
            throw new Error('Only owner can end session');
        }

        session.status = 'ended';
        session.endedAt = new Date();

        // Mark all participants as inactive
        session.participants.forEach(p => {
            p.isActive = false;
            p.leftAt = new Date();
        });

        await session.save();

        return session;
    }

    /**
     * Get user sessions
     */
    async getUserSessions(userId, status = 'active') {
        return CollaborativeSession.find({
            $or: [
                { ownerId: userId },
                { 'participants.userId': userId }
            ],
            status
        })
            .sort({ lastActivityAt: -1 })
            .limit(50)
            .lean();
    }

    /**
     * Get session statistics
     */
    async getSessionStatistics(sessionId) {
        const session = await CollaborativeSession.findOne({ sessionId }).lean();

        if (!session) {
            throw new Error('Session not found');
        }

        const totalParticipants = session.participants.length;
        const activeParticipants = session.participants.filter(p => p.isActive).length;
        const totalOperations = session.operationHistory.length;
        const duration = session.endedAt
            ? session.endedAt - session.startedAt
            : Date.now() - session.startedAt;

        return {
            sessionId,
            totalParticipants,
            activeParticipants,
            totalOperations,
            duration,
            status: session.status,
            startedAt: session.startedAt,
            endedAt: session.endedAt
        };
    }
}

module.exports = new CollaborationService();
