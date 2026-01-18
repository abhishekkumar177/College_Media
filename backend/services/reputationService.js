/**
 * Reputation Service
 * Issue #901: Content Moderation System with AI-Assisted Detection
 * 
 * Handles user reputation scoring based on moderation actions.
 */

class ReputationService {

    constructor() {
        // Reputation penalties by action type
        this.penalties = {
            warn: 5,
            hide: 15,
            remove: 30,
            ban_user: 100
        };

        // Reputation thresholds
        this.thresholds = {
            trusted: 100,      // Users with high reputation get less scrutiny
            normal: 50,        // Default level
            suspicious: 20,    // Increased scrutiny
            restricted: 0      // Heavy restrictions
        };
    }

    /**
     * Get user reputation score
     */
    async getUserReputation(userId) {
        // In production, this would query from database
        // For now, using in-memory or mock data
        try {
            const User = require('../models/User');
            const user = await User.findById(userId).select('reputation').lean();
            return user?.reputation || 50; // Default reputation
        } catch (error) {
            return 50;
        }
    }

    /**
     * Penalize user reputation
     */
    async penalizeUser(userId, action) {
        const penalty = this.penalties[action] || 10;

        try {
            const User = require('../models/User');
            await User.findByIdAndUpdate(userId, {
                $inc: { reputation: -penalty },
                $push: {
                    reputationHistory: {
                        change: -penalty,
                        reason: `Moderation action: ${action}`,
                        date: new Date()
                    }
                }
            });

            console.log(`[REPUTATION] User ${userId} penalized by ${penalty} points for ${action}`);
        } catch (error) {
            console.error('Reputation penalty error:', error);
        }
    }

    /**
     * Restore user reputation (after appeal)
     */
    async restoreReputation(userId, amount = null) {
        try {
            const User = require('../models/User');
            const increment = amount || 20; // Default restoration

            await User.findByIdAndUpdate(userId, {
                $inc: { reputation: increment },
                $push: {
                    reputationHistory: {
                        change: increment,
                        reason: 'Reputation restored after successful appeal',
                        date: new Date()
                    }
                }
            });

            console.log(`[REPUTATION] User ${userId} reputation restored by ${increment} points`);
        } catch (error) {
            console.error('Reputation restore error:', error);
        }
    }

    /**
     * Get user trust level based on reputation
     */
    getTrustLevel(reputation) {
        if (reputation >= this.thresholds.trusted) return 'trusted';
        if (reputation >= this.thresholds.normal) return 'normal';
        if (reputation >= this.thresholds.suspicious) return 'suspicious';
        return 'restricted';
    }

    /**
     * Check if user should get increased scrutiny
     */
    async shouldIncreaseScrutiny(userId) {
        const reputation = await this.getUserReputation(userId);
        return reputation < this.thresholds.suspicious;
    }

    /**
     * Award positive reputation
     */
    async awardReputation(userId, amount, reason) {
        try {
            const User = require('../models/User');
            await User.findByIdAndUpdate(userId, {
                $inc: { reputation: amount },
                $push: {
                    reputationHistory: {
                        change: amount,
                        reason,
                        date: new Date()
                    }
                }
            });
        } catch (error) {
            console.error('Award reputation error:', error);
        }
    }
}

module.exports = new ReputationService();
