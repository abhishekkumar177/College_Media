const express = require('express');
const router = express.Router();
const { versionMiddleware } = require('../../middleware/versionMiddleware');

router.use(versionMiddleware({ version: 'v2' }));

// Example v2 route
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to API v2'
    });
});

// Future v2 routes can be added here
// router.use('/auth', require('./auth')); 

module.exports = router;
