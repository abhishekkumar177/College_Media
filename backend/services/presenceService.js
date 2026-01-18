/**
 * Presence Service
 * Issue #923: Real-time Collaborative Features
 * 
 * Manages user presence and activity tracking in collaborative sessions.
 */

class PresenceService {

    constructor() {
        this.userPresence = new Map(); // userId -> presence data
        this.sessionPresence = new Map(); // sessionId -> Set of userIds
    }

    /**
     * Set user presence
     */
    setPresence(userId, status, metadata = {}) {
        this.userPresence.set(userId, {
            userId,
            status, // 'online', 'away', 'busy', 'offline'
            lastSeen: new Date(),
            metadata: {
                ...metadata,
                updatedAt: new Date()
            }
        });

        return this.userPresence.get(userId);
    }

    /**
     * Get user presence
     */
    getPresence(userId) {
        return this.userPresence.get(userId) || {
            userId,
            status: 'offline',
            lastSeen: null,
            metadata: {}
        };
    }

    /**
     * Join session
     */
    joinSession(sessionId, userId, metadata = {}) {
        if (!this.sessionPresence.has(sessionId)) {
            this.sessionPresence.set(sessionId, new Map());
        }

        const sessionUsers = this.sessionPresence.get(sessionId);
        sessionUsers.set(userId, {
            userId,
            joinedAt: new Date(),
            lastActivity: new Date(),
            cursor: null,
            selection: null,
            metadata
        });

        // Update user presence
        this.setPresence(userId, 'online', { currentSession: sessionId });

        return this.getSessionPresence(sessionId);
    }

    /**
     * Leave session
     */
    leaveSession(sessionId, userId) {
        const sessionUsers = this.sessionPresence.get(sessionId);

        if (sessionUsers) {
            sessionUsers.delete(userId);

            // Clean up empty sessions
            if (sessionUsers.size === 0) {
                this.sessionPresence.delete(sessionId);
            }
        }

        // Update user presence
        const presence = this.userPresence.get(userId);
        if (presence && presence.metadata.currentSession === sessionId) {
            delete presence.metadata.currentSession;
        }

        return this.getSessionPresence(sessionId);
    }

    /**
     * Update user activity in session
     */
    updateActivity(sessionId, userId, activityData = {}) {
        const sessionUsers = this.sessionPresence.get(sessionId);

        if (!sessionUsers) {
            return null;
        }

        const userPresence = sessionUsers.get(userId);

        if (!userPresence) {
            return null;
        }

        // Update activity
        userPresence.lastActivity = new Date();

        if (activityData.cursor !== undefined) {
            userPresence.cursor = activityData.cursor;
        }

        if (activityData.selection !== undefined) {
            userPresence.selection = activityData.selection;
        }

        if (activityData.metadata) {
            userPresence.metadata = {
                ...userPresence.metadata,
                ...activityData.metadata
            };
        }

        return userPresence;
    }

    /**
     * Get session presence
     */
    getSessionPresence(sessionId) {
        const sessionUsers = this.sessionPresence.get(sessionId);

        if (!sessionUsers) {
            return [];
        }

        return Array.from(sessionUsers.values());
    }

    /**
     * Get active users in session
     */
    getActiveUsers(sessionId, timeoutMs = 30000) {
        const sessionUsers = this.sessionPresence.get(sessionId);

        if (!sessionUsers) {
            return [];
        }

        const now = Date.now();
        const activeUsers = [];

        for (const user of sessionUsers.values()) {
            const timeSinceActivity = now - user.lastActivity.getTime();
            if (timeSinceActivity < timeoutMs) {
                activeUsers.push(user);
            }
        }

        return activeUsers;
    }

    /**
     * Get all user cursors in session
     */
    getSessionCursors(sessionId) {
        const sessionUsers = this.sessionPresence.get(sessionId);

        if (!sessionUsers) {
            return [];
        }

        return Array.from(sessionUsers.values())
            .filter(user => user.cursor !== null)
            .map(user => ({
                userId: user.userId,
                cursor: user.cursor,
                selection: user.selection,
                metadata: user.metadata
            }));
    }

    /**
     * Broadcast presence update
     */
    broadcastPresenceUpdate(sessionId, userId, socketService) {
        const presence = this.getSessionPresence(sessionId);

        if (socketService && socketService.io) {
            socketService.io.to(`session:${sessionId}`).emit('presence:update', {
                sessionId,
                userId,
                presence
            });
        }

        return presence;
    }

    /**
     * Clean up inactive users
     */
    cleanupInactiveUsers(timeoutMs = 300000) { // 5 minutes
        const now = Date.now();
        let cleanedCount = 0;

        for (const [sessionId, sessionUsers] of this.sessionPresence.entries()) {
            for (const [userId, user] of sessionUsers.entries()) {
                const timeSinceActivity = now - user.lastActivity.getTime();

                if (timeSinceActivity > timeoutMs) {
                    sessionUsers.delete(userId);
                    cleanedCount++;
                }
            }

            // Clean up empty sessions
            if (sessionUsers.size === 0) {
                this.sessionPresence.delete(sessionId);
            }
        }

        return cleanedCount;
    }

    /**
     * Get presence statistics
     */
    getStatistics() {
        const totalUsers = this.userPresence.size;
        const onlineUsers = Array.from(this.userPresence.values())
            .filter(p => p.status === 'online').length;
        const totalSessions = this.sessionPresence.size;

        let totalParticipants = 0;
        for (const sessionUsers of this.sessionPresence.values()) {
            totalParticipants += sessionUsers.size;
        }

        return {
            totalUsers,
            onlineUsers,
            totalSessions,
            totalParticipants,
            avgParticipantsPerSession: totalSessions > 0
                ? (totalParticipants / totalSessions).toFixed(2)
                : 0
        };
    }

    /**
     * Clear all presence data
     */
    clear() {
        this.userPresence.clear();
        this.sessionPresence.clear();
    }
}

module.exports = new PresenceService();
