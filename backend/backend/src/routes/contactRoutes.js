/**
 * Contact Routes
 * 
 * API endpoints for contact form operations.
 * 
 * @module routes/contactRoutes
 */

const express = require('express');
const router = express.Router();
const {
  submitContactMessage,
  getAllMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage,
  getMessageStats,
} = require('../controllers/contactController');

// Public route
router.post('/', submitContactMessage);

// Admin routes
router.get('/stats', getMessageStats);
router.get('/messages', getAllMessages);
router.get('/messages/:id', getMessageById);
router.patch('/messages/:id', updateMessageStatus);
router.delete('/messages/:id', deleteMessage);

module.exports = router;
