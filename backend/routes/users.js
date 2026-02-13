import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
//scgeck
import multer from "multer";
import path from "path";
import { requireRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// GET /api/users/by-username/:username - Get user by username (for sample/demo)
router.get("/by-username/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");
    if (!user) return res.status(404).json({ error: true, code: "USER_NOT_FOUND", message: "User not found" });
    res.json({ error: false, data: user });
  } catch (error) {
    res.status(500).json({ error: true, code: "SERVER_ERROR", message: "Server error", details: error.message });
  }
});

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "backend", "uploads"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.id}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB max
});

// GET /api/users/:id - Get user profile and posts
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: true, code: "USER_NOT_FOUND", message: "User not found" });
    const posts = await Post.find({ user: req.params.id }).sort({ createdAt: -1 });
    res.json({ error: false, data: { user, posts } });
  } catch (error) {
    res.status(500).json({ error: true, code: "SERVER_ERROR", message: "Server error", details: error.message });
  }
});

// PATCH /api/users/:id/avatar - Upload/update profile picture
router.patch("/:id/avatar", requireRoles(["admin", "moderator"]), upload.single("avatar"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    // Save avatar URL (relative path)
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ message: "Profile picture updated", avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
