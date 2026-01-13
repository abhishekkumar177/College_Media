const express = require('express');
const router = express.Router();
const {
  createAlumniProfile,
  getAlumniProfile,
  updateAlumniProfile,
  searchAlumni,
  sendConnectionRequest,
  respondToConnection,
  getMyConnections,
  createEvent,
  getEvents,
  registerForEvent,
  getAlumniStats
} = require('../controllers/alumniController');
const { protect } = require('../middleware/authMiddleware');
const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Profile routes
router.post(
  '/profile',
  protect,
  [
    body('graduationYear')
      .isInt({ min: 1900, max: new Date().getFullYear() + 10 })
      .withMessage('Invalid graduation year'),
    body('degree').notEmpty().withMessage('Degree is required'),
    body('major').notEmpty().withMessage('Major is required'),
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be 500 characters or less'),
    body('visibility').optional().isIn(['public', 'alumni-only', 'private'])
  ],
  validate,
  createAlumniProfile
);

router.get('/profile/:id?', protect, getAlumniProfile);

router.put(
  '/profile',
  protect,
  [
    body('bio').optional().isLength({ max: 500 }),
    body('visibility').optional().isIn(['public', 'alumni-only', 'private']),
    body('skills').optional().isArray(),
    body('mentorshipAreas').optional().isArray()
  ],
  validate,
  updateAlumniProfile
);

// Search route
router.get(
  '/search',
  protect,
  [
    query('graduationYear').optional().isInt(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  searchAlumni
);

// Connection routes
router.post(
  '/connections/request',
  protect,
  [
    body('recipientId')
      .notEmpty().withMessage('Recipient ID is required')
      .isMongoId().withMessage('Invalid recipient ID format'),
    body('message').optional().isLength({ max: 300 }).withMessage('Message must be 300 characters or less')
  ],
  validate,
  sendConnectionRequest
);

router.put(
  '/connections/:connectionId',
  protect,
  [
    param('connectionId').isMongoId(),
    body('status').isIn(['accepted', 'rejected']).withMessage('Invalid status')
  ],
  validate,
  respondToConnection
);

router.get(
  '/connections',
  protect,
  [
    query('status').optional().isIn(['pending', 'accepted', 'rejected'])
  ],
  validate,
  getMyConnections
);

// Event routes
router.post(
  '/events',
  protect,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('eventType')
      .isIn(['networking', 'workshop', 'reunion', 'webinar', 'career-fair', 'social', 'other'])
      .withMessage('Invalid event type'),
    body('startDate').isISO8601().withMessage('Invalid start date'),
    body('endDate').isISO8601().withMessage('Invalid end date'),
    body('location.type').isIn(['virtual', 'physical', 'hybrid'])
  ],
  validate,
  createEvent
);

router.get(
  '/events',
  protect,
  [
    query('eventType').optional().isIn(['networking', 'workshop', 'reunion', 'webinar', 'career-fair', 'social', 'other']),
    query('status').optional().isIn(['draft', 'published', 'cancelled', 'completed']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  getEvents
);

router.post(
  '/events/:eventId/register',
  protect,
  [
    param('eventId').isMongoId()
  ],
  validate,
  registerForEvent
);

// Statistics route
router.get('/stats', protect, getAlumniStats);

module.exports = router;
