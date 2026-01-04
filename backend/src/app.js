// src/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "College Media Backend is Healthy 🚀",
  });
});

module.exports = app;
