const mongoose = require("mongoose");
const logger = require("./logger");

/**
 * =====================================
 * MongoDB Transaction Helper
 * =====================================
 */
const runInTransaction = async (operation, options = {}) => {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      result = await operation(session);
    }, options);

    return result;
  } catch (error) {
    logger.error("Transaction failed", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = { runInTransaction };
