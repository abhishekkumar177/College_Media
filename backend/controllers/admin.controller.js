const { logAudit } = require("../utils/auditLogger");

exports.updateUserRole = async (req, res) => {
  const { userId, newRole } = req.body;

  try {
    // role update logic

    await logAudit({
      actorId: req.user.id,
      actorRole: "ADMIN",
      action: "ROLE_UPDATED",
      targetId: userId,
      status: "SUCCESS",
      req,
      metadata: {
        newRole,
      },
    });

    res.json({ success: true });
  } catch (err) {
    await logAudit({
      actorId: req.user.id,
      actorRole: "ADMIN",
      action: "ROLE_UPDATED",
      targetId: userId,
      status: "FAILED",
      req,
      metadata: {
        error: err.message,
      },
    });

    res.status(500).json({ success: false });
  }
};
