const express = require('express');
const router = express.Router();
const { versionMiddleware } = require('../../middleware/versionMiddleware');

// Apply version header to all v1 routes
router.use(versionMiddleware({ version: 'v1' }));

// Auth Routes
router.use('/auth', require('../auth'));
router.use('/users', require('../users'));
router.use('/posts', require('../posts'));
router.use('/messages', require('../messages'));
router.use('/account', require('../account'));
router.use('/search', require('../search'));
router.use('/moderation', require('../moderation'));

module.exports = router;
