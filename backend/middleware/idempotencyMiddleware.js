const crypto = require("crypto");

const idempotencyStore = new Map();

/**
 * =====================================
 * Idempotency Middleware
 * =====================================
 */
const idempotencyGuard = (req, res, next) => {
  const key = req.headers["idempotency-key"];
  if (!key) return next();

  const hash = crypto
    .createHash("sha256")
    .update(key + req.originalUrl)
    .digest("hex");

  if (idempotencyStore.has(hash)) {
    return res.status(409).json({
      success: false,
      message: "Duplicate request detected",
    });
  }

  idempotencyStore.set(hash, true);
  setTimeout(() => idempotencyStore.delete(hash), 5 * 60 * 1000);

  next();
};

module.exports = { idempotencyGuard };
