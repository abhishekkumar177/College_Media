/**
 * ContactMessage Model
 * 
 * Schema for storing contact form submissions from users.
 * Tracks messages, categories, status, and handling information.
 * 
 * @module models/ContactMessage
 */

// In-memory store (can be migrated to MongoDB/PostgreSQL when database is integrated)
const contactMessages = [];

/**
 * Generate a unique ID for messages
 * @returns {string} UUID-like identifier
 */
const generateId = () => {
  return 'msg_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/**
 * Create a new contact message
 * @param {Object} messageData - Message data from form submission
 * @returns {Object} Created message with ID and timestamps
 */
const createMessage = (messageData) => {
  const newMessage = {
    id: generateId(),
    name: messageData.name,
    email: messageData.email,
    category: messageData.category,
    subject: messageData.subject,
    message: messageData.message,
    attachments: messageData.attachments || [],
    status: 'pending',
    handledBy: null,
    ipAddress: messageData.ipAddress || null,
    userAgent: messageData.userAgent || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resolvedAt: null,
  };

  contactMessages.push(newMessage);
  return newMessage;
};

/**
 * Get all contact messages
 * @param {Object} filters - Optional filters (status, category, etc.)
 * @returns {Array} Array of messages
 */
const getAllMessages = (filters = {}) => {
  let messages = [...contactMessages];

  if (filters.status) {
    messages = messages.filter((msg) => msg.status === filters.status);
  }

  if (filters.category) {
    messages = messages.filter((msg) => msg.category === filters.category);
  }

  messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return messages;
};

/**
 * Get a single message by ID
 * @param {string} id - Message ID
 * @returns {Object|null} Message object or null
 */
const getMessageById = (id) => {
  return contactMessages.find((msg) => msg.id === id) || null;
};

/**
 * Update message status
 * @param {string} id - Message ID
 * @param {Object} updateData - Fields to update
 * @returns {Object|null} Updated message or null
 */
const updateMessage = (id, updateData) => {
  const index = contactMessages.findIndex((msg) => msg.id === id);
  
  if (index === -1) return null;

  contactMessages[index] = {
    ...contactMessages[index],
    ...updateData,
    updatedAt: new Date().toISOString(),
  };

  if (updateData.status === 'resolved') {
    contactMessages[index].resolvedAt = new Date().toISOString();
  }

  return contactMessages[index];
};

/**
 * Delete a message
 * @param {string} id - Message ID
 * @returns {boolean} Success status
 */
const deleteMessage = (id) => {
  const index = contactMessages.findIndex((msg) => msg.id === id);
  if (index === -1) return false;
  contactMessages.splice(index, 1);
  return true;
};

/**
 * Get message count by status
 * @returns {Object} Count by status
 */
const getMessageStats = () => {
  return {
    total: contactMessages.length,
    pending: contactMessages.filter((msg) => msg.status === 'pending').length,
    inProgress: contactMessages.filter((msg) => msg.status === 'in-progress').length,
    resolved: contactMessages.filter((msg) => msg.status === 'resolved').length,
    closed: contactMessages.filter((msg) => msg.status === 'closed').length,
  };
};

module.exports = {
  createMessage,
  getAllMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  getMessageStats,
};
