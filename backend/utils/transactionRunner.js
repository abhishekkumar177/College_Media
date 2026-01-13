/**
 * ============================================================
 * TransactionRunner – Atomic DB Operation Executor
 * ------------------------------------------------------------
 * ✔ Ensures atomicity for bulk operations
 * ✔ Automatic commit / rollback
 * ✔ Prevents partial writes
 * ✔ Centralized & reusable
 * ✔ Safe error handling
 * ✔ Production-ready
 * ============================================================
 */

const mongoose = require("mongoose");
const logger = require("./logger");

/* ============================================================
   ⚙️ CONFIG
============================================================ */

const DEFAULT_TX_OPTIONS = {
  readPreference: "primary",
  readConcern: { level: "local" },
  writeConcern: { w: "majority" },
};

/* ============================================================
   🧠 INTERNAL HELPERS
============================================================ */

/**
 * Check mongoose connection
 */
const ensureConnection = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error(
      "Database not connected. Cannot start transaction."
    );
  }
};

/**
 * Safe abort transaction
 */
const safeAbort = async (session) => {
  try {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
  } catch (err) {
    logger.error("Failed to abort transaction", {
      error: err.message,
    });
  }
};

/**
 * Safe end session
 */
const safeEnd = async (session) => {
  try {
    await session.endSession();
  } catch (err) {
    logger.warn("Failed to end session", {
      error: err.message,
    });
  }
};

/* ============================================================
   🧱 TRANSACTION RUNNER CORE
============================================================ */

/**
 * Run operations inside a MongoDB transaction
 */
const runInTransaction = async (
  operation,
  options = {}
) => {
  ensureConnection();

  if (typeof operation !== "function") {
    throw new Error(
      "Transaction operation must be a function"
    );
  }

  const session = await mongoose.startSession();
  const txOptions = {
    ...DEFAULT_TX_OPTIONS,
    ...options,
  };

  let result;

  try {
    session.startTransaction(txOptions);

    logger.info("Transaction started");

    result = await operation(session);

    await session.commitTransaction();

    logger.info("Transaction committed successfully");

    return result;
  } catch (error) {
    logger.error("Transaction failed, rolling back", {
      error: error.message,
      stack: error.stack,
    });

    await safeAbort(session);

    throw error;
  } finally {
    await safeEnd(session);
  }
};

/* ============================================================
   📦 BULK OPERATION HELPERS
============================================================ */

/**
 * Bulk insert helper
 */
const bulkInsert = async (
  Model,
  docs = [],
  options = {}
) => {
  if (!Array.isArray(docs) || docs.length === 0) {
    throw new Error("bulkInsert requires non-empty array");
  }

  return runInTransaction(async (session) => {
    return Model.insertMany(docs, {
      session,
      ordered: true,
      ...options,
    });
  });
};

/**
 * Bulk update helper
 */
const bulkUpdate = async (
  Model,
  operations = [],
  options = {}
) => {
  if (!Array.isArray(operations)) {
    throw new Error(
      "bulkUpdate requires operations array"
    );
  }

  return runInTransaction(async (session) => {
    return Model.bulkWrite(operations, {
      session,
      ordered: true,
      ...options,
    });
  });
};

/**
 * Bulk delete helper
 */
const bulkDelete = async (
  Model,
  filter,
  options = {}
) => {
  if (!filter || typeof filter !== "object") {
    throw new Error(
      "bulkDelete requires a valid filter"
    );
  }

  return runInTransaction(async (session) => {
    return Model.deleteMany(filter, {
      session,
      ...options,
    });
  });
};

/* ============================================================
   🧪 ADVANCED USAGE – MULTI-MODEL TRANSACTIONS
============================================================ */

/**
 * Execute multi-model operations atomically
 */
const runMultiModelTransaction = async (
  operations = []
) => {
  if (!Array.isArray(operations)) {
    throw new Error(
      "Operations must be an array of functions"
    );
  }

  return runInTransaction(async (session) => {
    const results = [];

    for (const op of operations) {
      if (typeof op !== "function") {
        throw new Error(
          "Each operation must be a function"
        );
      }

      const res = await op(session);
      results.push(res);
    }

    return results;
  });
};

/* ============================================================
   📊 DEBUG / MONITORING HELPERS
============================================================ */

/**
 * Check transaction capability
 */
const isTransactionSupported = () => {
  return (
    mongoose.connection.readyState === 1 &&
    mongoose.connection.client?.topology?.description
      ?.type === "ReplicaSet"
  );
};

/* ============================================================
   📤 EXPORTS
============================================================ */

module.exports = {
  runInTransaction,
  bulkInsert,
  bulkUpdate,
  bulkDelete,
  runMultiModelTransaction,
  isTransactionSupported,
};
