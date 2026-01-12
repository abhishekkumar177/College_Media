const express = require("express");
const validateSession = require("../middleware/sessionValidator");

const router = express.Router();

/* ---------------- PROTECTED TEST ROUTE ---------------- */
router.get("/test", validateSession, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed",
    user: req.user,
  });
});

module.exports = router;
