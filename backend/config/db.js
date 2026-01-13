const mongoose = require('mongoose');
const fs = require('fs');
const logger = require('../utils/logger');
const { initializePool, healthCheck } = require('./dbPool');
const { initializeQueryMonitoring } = require('../middleware/queryMonitor');

let useMongoDB = true;
let isConnected = false;

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

/* ------------------
   🔐 CRON JOB LOCK (ANTI-OVERLAP)
------------------ */
const acquireJobLock = async (jobName, ttlMs = 60000) => {
  if (!useMongoDB || !mongoose) return true;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMs);

  const LockSchema = new mongoose.Schema(
    {
      jobName: { type: String, unique: true },
      lockedAt: Date,
      expiresAt: Date,
    },
    { collection: LOCK_COLLECTION }
  );

  const Lock =
    mongoose.models.JobLock || mongoose.model("JobLock", LockSchema);

  try {
    await Lock.findOneAndUpdate(
      {
        jobName,
        $or: [
          { expiresAt: { $lt: now } },
          { expiresAt: { $exists: false } },
        ],
      },
      {
        jobName,
        lockedAt: now,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    return true;
  } catch (err) {
    console.warn(`🔒 Job "${jobName}" already running`);
    return false;
  }
};

const releaseJobLock = async (jobName) => {
  if (!useMongoDB || !mongoose) return;

  const Lock =
    mongoose.models.JobLock || mongoose.model("JobLock");

  try {
    await Lock.deleteOne({ jobName });
    console.log(`🔓 Job lock released: ${jobName}`);
  } catch (err) {
    console.error("❌ Failed to release job lock:", err.message);
  }
};

/* ------------------
   🧹 CLEANUP
------------------ */
const closeDB = async () => {
  if (useMongoDB && mongoose?.connection?.readyState === 1) {
    await mongoose.connection.close(false);
    console.log("🧹 MongoDB connection closed");
  }
};

/* ------------------
   📊 STATUS
------------------ */
const getDBStatus = () => ({
  useMongoDB,
  connected: isConnected,
});

/* ------------------
   📦 EXPORTS
------------------ */
module.exports = {
  initDB,
  closeDB,
  acquireJobLock,
  releaseJobLock,
  getDBStatus,
};
