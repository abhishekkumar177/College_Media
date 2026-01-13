const express = require("express");
const router = express.Router();
const {
  checkExternalService,
} = require("../controllers/externalApiController");

router.get("/status", checkExternalService);

module.exports = router;
