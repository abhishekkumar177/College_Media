import { Router } from "express";
import Post from "../models/Post.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";
import redisClient from "../config/redisClient.js";

const router = Router();

/**
 * ✅ TEST ROUTE
 * GET /api/v1/posts
 */
router.get("/", (req, res) => {
  res.json({ message: "Posts route working" });
});

/**
 * ✅ CREATE POST
 * POST /api/v1/posts
 * Access: Any authenticated user
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { caption } = req.body;

    if (!caption) {
      return res.status(400).json({ message: "Caption is required" });
    }

    const post = await Post.create({
      caption,
      user: req.user.userId,
    });

    // 🔥 Cache invalidate (feed data outdated)
    await redisClient.del("posts:feed");

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create post" });
  }
});

/**
 * ✅ FEED (CACHED)
 * GET /api/v1/posts/feed
 * Access: Public
 */
router.get("/feed", async (req, res) => {
  try {
    // 1️⃣ Check cache first
    const cachedFeed = await redisClient.get("posts:feed");

    if (cachedFeed) {
      return res.json({
        success: true,
        source: "cache",
        data: JSON.parse(cachedFeed),
      });
    }

    // 2️⃣ Fetch from DB
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "username email");

    // 3️⃣ Store in cache (TTL = 60 sec)
    await redisClient.setEx(
      "posts:feed",
      60,
      JSON.stringify(posts)
    );

    res.json({
      success: true,
      source: "db",
      data: posts,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feed" });
  }
});

/**
 * ❌ DELETE POST
 * DELETE /api/v1/posts/:id
 *
 * Rules:
 * - Owner → allowed
 * - Admin / Moderator → allowed
 * - Others → denied
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isOwner = post.user.toString() === req.user.userId;
    const isAdminOrModerator =
      req.user.role === "admin" || req.user.role === "moderator";

    if (!isOwner && !isAdminOrModerator) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await post.deleteOne();

    // 🔥 Cache invalidate after delete
    await redisClient.del("posts:feed");

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete post" });
  }
});

export default router;
