const mongoose = require('mongoose');
const fs = require('fs');
const logger = require('../utils/logger');
const { initializePool, healthCheck } = require('./dbPool');
const { initializeQueryMonitoring } = require('../middleware/queryMonitor');

// Check if MongoDB is available by attempting to connect with a timeout
let useMongoDB = true;

// Function to initialize database connection with pooling
const initDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college_media';

  // Try to connect to MongoDB with connection pooling
  try {
    // Initialize connection pool
    await initializePool(MONGODB_URI);

    // Initialize query monitoring
    initializeQueryMonitoring(mongoose);

    logger.info('MongoDB connected successfully with connection pooling');
    useMongoDB = true;

    return {
      useMongoDB: true,
      mongoose,
      healthCheck
    };
  } catch (error) {
    logger.warn(`MongoDB connection failed: ${error.message}`);
    logger.info('Falling back to file-based database for development');
    useMongoDB = false;
    return {
      useMongoDB: false,
      mongoose: null,
      healthCheck: null
    };
  }
};

module.exports = { initDB, useMongoDB };