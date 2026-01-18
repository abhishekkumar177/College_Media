const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const collabController = require('../controllers/collabController');

router.post('/documents', protect, collabController.createDocument);
router.get('/documents', protect, collabController.getDocuments);
router.get('/documents/:id', protect, collabController.getDocument);
router.delete('/documents/:id', protect, collabController.deleteDocument);

module.exports = router;
