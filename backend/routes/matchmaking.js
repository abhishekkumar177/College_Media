/**
 * Matchmaking Routes
 * API endpoints for study buddy matching system
 */

const express = require('express');
const router = express.Router();
const {
  getMatches,
  getNextMatch,
  recordInteraction,
  getCompatibility,
  syncProfile,
  syncAllUsers,
  searchStudyBuddies
} = require('../controllers/matchmakingController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/matchmaking/matches:
 *   get:
 *     summary: Get study buddy matches for current user
 *     tags: [Matchmaking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of matches to return
 *       - in: query
 *         name: minScore
 *         schema:
 *           type: integer
 *           default: 40
 *         description: Minimum compatibility score (0-100)
 *       - in: query
 *         name: refresh
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Force refresh (bypass cache)
 *     responses:
 *       200:
 *         description: List of matched study buddies
 *       401:
 *         description: Unauthorized
 */
router.get('/matches', protect, getMatches);

/**
 * @swagger
 * /api/matchmaking/next:
 *   get:
 *     summary: Get next match for swipe interface
 *     tags: [Matchmaking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: excludeIds
 *         schema:
 *           type: string
 *         description: JSON array of user IDs to exclude
 *     responses:
 *       200:
 *         description: Next match or null if no more matches
 *       401:
 *         description: Unauthorized
 */
router.get('/next', protect, getNextMatch);

/**
 * @swagger
 * /api/matchmaking/interact:
 *   post:
 *     summary: Record match interaction (like/pass/superlike)
 *     tags: [Matchmaking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *               - action
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 description: ID of the user being interacted with
 *               action:
 *                 type: string
 *                 enum: [like, pass, superlike]
 *                 description: Type of interaction
 *     responses:
 *       200:
 *         description: Interaction recorded successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/interact', protect, recordInteraction);

/**
 * @swagger
 * /api/matchmaking/compatibility/{userId}:
 *   get:
 *     summary: Get detailed compatibility analysis with another user
 *     tags: [Matchmaking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to check compatibility with
 *     responses:
 *       200:
 *         description: Compatibility details
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get('/compatibility/:userId', protect, getCompatibility);

/**
 * @swagger
 * /api/matchmaking/search:
 *   get:
 *     summary: Search for study buddies by text query
 *     tags: [Matchmaking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Missing query parameter
 *       401:
 *         description: Unauthorized
 */
router.get('/search', protect, searchStudyBuddies);

/**
 * @swagger
 * /api/matchmaking/sync:
 *   post:
 *     summary: Sync current user profile to vector store
 *     tags: [Matchmaking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile synced successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/sync', protect, syncProfile);

/**
 * @swagger
 * /api/matchmaking/sync-all:
 *   post:
 *     summary: Sync all users to vector store (admin only)
 *     tags: [Matchmaking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All users synced successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/sync-all', protect, syncAllUsers); // Add admin middleware if needed

module.exports = router;
