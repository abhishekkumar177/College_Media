/**
 * Contact Controller
 * 
 * Handles contact form operations including submission, validation,
 * rate limiting, and admin message management.
 * 
 * @module controllers/contactController
 */

const ContactMessage = require('../models/ContactMessage');

// Rate limiting store
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_SUBMISSIONS_PER_WINDOW = 5;

/**
 * Check rate limit for IP address
 */
const checkRateLimit = (ip) => {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_SUBMISSIONS_PER_WINDOW - 1 };
  }

  if (now - record.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_SUBMISSIONS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_SUBMISSIONS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetTime: record.windowStart + RATE_LIMIT_WINDOW };
  }

  record.count++;
  return { allowed: true, remaining: MAX_SUBMISSIONS_PER_WINDOW - record.count };
};

/**
 * Validate contact form data
 */
const validateContactData = (data) => {
  const errors = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  const validCategories = ['bug', 'account', 'feedback', 'partnership', 'feature', 'other'];
  if (!data.category || !validCategories.includes(data.category)) {
    errors.category = 'Please select a valid category';
  }

  if (!data.subject || data.subject.trim().length < 5) {
    errors.subject = 'Subject must be at least 5 characters';
  }

  if (!data.message || data.message.trim().length < 20) {
    errors.message = 'Message must be at least 20 characters';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Submit a new contact message
 * POST /api/v1/contact
 */
exports.submitContactMessage = async (req, res) => {
  try {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Too many submissions. Please try again later.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      });
    }

    const validation = validateContactData(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const newMessage = ContactMessage.createMessage({
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase(),
      category: req.body.category,
      subject: req.body.subject.trim(),
      message: req.body.message.trim(),
      ipAddress: clientIp,
      userAgent: req.get('User-Agent') || 'unknown',
    });

    console.log(`📧 New contact message: ${newMessage.name} <${newMessage.email}> - ${newMessage.subject}`);

    return res.status(201).json({
      success: true,
      message: 'Your message has been submitted successfully.',
      data: { id: newMessage.id, createdAt: newMessage.createdAt },
      rateLimit: { remaining: rateLimit.remaining },
    });
  } catch (error) {
    console.error('CONTACT SUBMISSION ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while submitting your message.',
    });
  }
};

/**
 * Get all contact messages (Admin)
 * GET /api/v1/contact/messages
 */
exports.getAllMessages = async (req, res) => {
  try {
    const { status, category } = req.query;
    const messages = ContactMessage.getAllMessages({ status, category });
    return res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve messages' });
  }
};

/**
 * Get a single message by ID (Admin)
 * GET /api/v1/contact/messages/:id
 */
exports.getMessageById = async (req, res) => {
  try {
    const message = ContactMessage.getMessageById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    return res.status(200).json({ success: true, data: message });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve message' });
  }
};

/**
 * Update message status (Admin)
 * PATCH /api/v1/contact/messages/:id
 */
exports.updateMessageStatus = async (req, res) => {
  try {
    const { status, handledBy } = req.body;
    const validStatuses = ['pending', 'in-progress', 'resolved', 'closed'];
    
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const updatedMessage = ContactMessage.updateMessage(req.params.id, { status, handledBy });
    if (!updatedMessage) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    return res.status(200).json({ success: true, data: updatedMessage });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update message' });
  }
};

/**
 * Delete a message (Admin)
 * DELETE /api/v1/contact/messages/:id
 */
exports.deleteMessage = async (req, res) => {
  try {
    const deleted = ContactMessage.deleteMessage(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    return res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
};

/**
 * Get message statistics (Admin)
 * GET /api/v1/contact/stats
 */
exports.getMessageStats = async (req, res) => {
  try {
    const stats = ContactMessage.getMessageStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve statistics' });
  }
};
