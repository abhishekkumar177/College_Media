import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";

import postsRoutes from "./routes/posts.js";
import authRoutes from "./routes/auth.js";

const app = express();

// Load env variables
dotenv.config();

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

// Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🔥 BACKEND RUNNING ON ${PORT} 🔥`);
});
