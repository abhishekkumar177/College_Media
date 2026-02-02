import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import postsRoutes from "./routes/posts.js";
import chatRoutes from "./routes/chat.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

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
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
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
