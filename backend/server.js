import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";


import authRoutes from "./routes/auth.js";
import postsRoutes from "./routes/posts.js";
import chatRoutes from "./routes/chat.route.js";
import commentsRoutes from "./routes/comments.js";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

// Rate limiters
const authLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 10, // limit each IP to 10 requests per windowMs
   message: { message: "Too many authentication attempts, please try again later." }
});

const createLimiter = rateLimit({
   windowMs: 5 * 60 * 1000, // 5 minutes
   max: 20, // limit each IP to 20 create requests per windowMs
   message: { message: "Too many requests, please slow down." }
});

/* =========================
   DATABASE CONNECTION
========================= */
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/college-media")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

/* =========================
   ROUTES
========================= */
// Apply rate limiter to auth routes (register, login)
import authRouter from "./routes/auth.js";
app.use("/api/auth/register", authLimiter, authRouter);
app.use("/api/auth/login", authLimiter, authRouter);
// Other auth routes (logout, profile, etc.)
app.use("/api/auth", authRouter);

// Apply rate limiter to post and comment creation
import postsRouter from "./routes/posts.js";
import commentsRouter from "./routes/comments.js";
app.use("/api/posts", (req, res, next) => {
   if (req.method === "POST") {
      return createLimiter(req, res, next);
   }
   next();
}, postsRouter);
app.use("/api/comments", (req, res, next) => {
   if (req.method === "POST") {
      return createLimiter(req, res, next);
   }
   next();
}, commentsRouter);
app.use("/api/chat", chatRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.json({ message: "College Media Backend Running" });
});

/* =========================
   SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
