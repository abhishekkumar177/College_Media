const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// routes
app.use("/api/v1/auth", authRoutes);

// health check
app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    message: "College Media Backend is healthy",
  });
});

module.exports = app;
