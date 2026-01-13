/**
 * ============================================================
 * Audit Middleware
 * ------------------------------------------------------------
 * Automatically logs sensitive route actions
 * ============================================================
 */

const { logAudit } = require("../utils/auditLogger");

const auditMiddleware = (action) => {
  return async (req, res, next) => {
    res.on("finish", async () => {
      if (res.statusCode < 400) {
        await logAudit({
          actorId: req.user?.id,
          actorRole: req.user?.role,
          action,
          targetId: req.params?.id,
          status: "SUCCESS",
          req,
        });
      } else {
        await logAudit({
          actorId: req.user?.id,
          actorRole: req.user?.role,
          action,
          targetId: req.params?.id,
          status: "FAILED",
          req,
          metadata: {
            statusCode: res.statusCode,
          },
        });
      }
    });

    next();
  };
};

module.exports = auditMiddleware;
