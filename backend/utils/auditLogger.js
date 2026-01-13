/**
 * ============================================================
 * Central Audit Logger
 * ------------------------------------------------------------
 * Records security-sensitive actions in immutable audit logs
 * ============================================================
 */

const AuditLog = require("../models/AuditLog");
const logger = require("./logger");

const logAudit = async ({
  actorId = null,
  actorRole = "USER",
  action,
  targetId = null,
  status = "SUCCESS",
  req = null,
  metadata = {},
}) => {
  try {
    const auditEntry = {
      actorId,
      actorRole,
      action,
      targetId,
      status,
      ipAddress: req?.ip || "UNKNOWN",
      userAgent: req?.headers["user-agent"] || "UNKNOWN",
      metadata,
    };

    await AuditLog.create(auditEntry);
  } catch (err) {
    // Audit logging must NEVER break main flow
    logger.error("Audit log failed", {
      error: err.message,
      action,
    });
  }
};

module.exports = { logAudit };
