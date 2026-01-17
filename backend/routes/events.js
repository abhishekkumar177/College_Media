const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const eventController = require('../controllers/eventController');

router.post('/', protect, eventController.createEvent);
router.get('/', eventController.getEvents);
router.get('/tickets/my', protect, eventController.getMyTickets);
router.post('/verify-ticket', protect, eventController.verifyTicket); // Organizer scan
router.get('/:id', eventController.getEvent);
router.post('/:id/tickets', protect, eventController.purchaseTicket);

module.exports = router;
