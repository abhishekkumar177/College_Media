/**
 * ======================================
 *  Database Initialization & Management
 *  MongoDB with Fallback + Lock Support
 * ======================================
 */

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

/* ------------------
   🌱 CONFIG
------------------ */
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/college_media";

const CONNECTION_TIMEOUT = 5000;
const LOCK_COLLECTION = "job_locks";

let useMongoDB = true;
let isConnected = false;

/* ------------------
   📁 FILE DB FALLBACK
------------------ */
const fileDBPath = path.join(__dirname, "../data");
if (!fs.existsSync(fileDBPath)) {
  fs.mkdirSync(fileDBPath, { recursive: true });
}

/* ------------------
   🔌 INIT DB
------------------ */
const initDB = async () => {
  try {
    const connectPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: CONNECTION_TIMEOUT,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("MongoDB connection timeout")),
        CONNECTION_TIMEOUT
      )
    );

    await Promise.race([connectPromise, timeoutPromise]);

    isConnected = true;
    useMongoDB = true;

    console.log("✅ MongoDB connected");

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔁 MongoDB reconnected");
      isConnected = true;
    });

    return {
      useMongoDB: true,
      mongoose,
      isConnected: () => isConnected,
    };
  } catch (err) {
    console.warn("❌ MongoDB unavailable:", err.message);
    console.log("📁 Falling back to file-based storage");

    useMongoDB = false;
    isConnected = false;

    return {
      useMongoDB: false,
      mongoose: null,
      isConnected: () => false,
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
