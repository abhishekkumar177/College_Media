const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const { protect, admin } = require('../middleware/authMiddleware'); // Assuming admin middleware exists or just protect

router.get('/dashboard', protect, async (req, res) => {
    try {
        const metrics = await analyticsService.getDashboardMetrics();
        const activity = await analyticsService.getHourlyActivity();

        res.json({
            success: true,
            data: {
                ...metrics,
                activityCurve: activity
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
