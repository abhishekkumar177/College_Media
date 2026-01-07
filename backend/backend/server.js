import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";

import postsRoutes from "./routes/posts.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/v1/posts", postsRoutes);
app.use("/api/v1/auth", authRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ ok: true });
});

// 🔥 PORT MUST BE DECLARED BEFORE USE
const PORT = process.env.PORT || 5001;

// ✅ Start server
const server = app.listen(PORT, () => {
  console.log(`🔥 BACKEND RUNNING ON ${PORT} 🔥`);
});

// 🛑 Graceful Shutdown
const gracefulShutdown = (signal) => {
  console.log(`🛑 Received ${signal}. Closing server gracefully...`);

  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("❌ Force shutdown");
    process.exit(1);
  }, 10000);
};

// Handle termination signals
process.on("SIGINT", gracefulShutdown);   // Ctrl + C
process.on("SIGTERM", gracefulShutdown);  // Server stop / deploy
