/**
 * ======================================
 * In-Memory Cache + Warm-Up Support
 * Lightweight & Redis-Ready
 * ======================================
 */

const logger = require("./logger");

const cacheStore = new Map();

/* ------------------
   ⏱️ SET CACHE
------------------ */
const setCache = (key, value, ttlMs = 60000) => {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

/* ------------------
   📦 GET CACHE
------------------ */
const getCache = (key) => {
  const data = cacheStore.get(key);

  if (!data) return null;

  if (Date.now() > data.expiresAt) {
    cacheStore.delete(key);
    return null;
  }

  return data.value;
};

/* ------------------
   🧹 CLEAR CACHE
------------------ */
const clearCache = () => cacheStore.clear();

/* ------------------
   🔥 CACHE WARM-UP
------------------ */
const warmUpCache = async (models = {}) => {
  try {
    logger.info("🔥 Cache warm-up started");

    if (models.User) {
      const users = await models.User.find().limit(50).lean();
      setCache("users:top", users, 10 * 60 * 1000);
    }

    if (models.Resume) {
      const resumes = await models.Resume.find().limit(20).lean();
      setCache("resumes:recent", resumes, 10 * 60 * 1000);
    }

    logger.info("✅ Cache warm-up completed");
  } catch (err) {
    logger.warn("⚠️ Cache warm-up failed", { error: err.message });
  }
};

module.exports = {
  setCache,
  getCache,
  clearCache,
  warmUpCache,
};
