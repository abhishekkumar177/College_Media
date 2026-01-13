const express = require("express");
const router = express.Router();
const auditMiddleware = require("../middleware/audit.middleware");
const adminController = require("../controllers/admin.controller");

router.put(
  "/role",
  auditMiddleware("ROLE_UPDATED"),
  adminController.updateUserRole
);

module.exports = router;
