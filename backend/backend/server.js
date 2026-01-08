import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";

import postsRoutes from "./routes/posts.js";
import authRoutes from "./routes/auth.js";
import errorHandler from "./middleware/errorHandler.js";
import protectedRoutes from "./routes/protected.js";

dotenv.config();

const app = express();

/* =======================
   🌐 GLOBAL MIDDLEWARES
======================= */
app.use(express.json());
app.use("/api/v1/protected", protectedRoutes);

// morgan only in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* =======================
   ⏱️ API TIMEOUT MIDDLEWARE
======================= */
app.use((req, res, next) => {
  res.setTimeout(10000, () => {
    return res.status(503).json({
      success: false,
      message: "Request timeout. Please try again later.",
    });
  });
  next();
});

/* =======================
   🚏 ROUTES
======================= */
app.use("/api/v1/posts", postsRoutes);
app.use("/api/v1/auth", authRoutes);

/* =======================
   ❤️ HEALTH CHECK
======================= */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running 🚀",
  });
});

/* =======================
   ❌ 404 HANDLER
======================= */
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* =======================
   🔥 GLOBAL ERROR HANDLER
======================= */
app.use(errorHandler);

/* =======================
   🚀 SERVER START
======================= */
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`🔥 BACKEND RUNNING ON PORT ${PORT} 🔥`);
});

/* =======================
   🛑 GRACEFUL SHUTDOWN
======================= */
const gracefulShutdown = (signal) => {
  console.log(`🛑 Received ${signal}. Shutting down gracefully...`);

  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("❌ Force shutdown");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
