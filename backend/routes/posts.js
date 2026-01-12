const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");

const JWT_SECRET = process.env.JWT_SECRET || "college_media_secret_key";

/* ---------------- AUTH MIDDLEWARE ---------------- */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      message: "Access denied. No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      data: null,
      message: "Invalid token",
    });
  }
};

/* =========================================================
   ❌ BEFORE (N+1 PROBLEM – DON'T DO THIS)
   =========================================================
   const posts = await Post.find();
   for (let post of posts) {
     post.user = await User.findById(post.userId);
     post.comments = await Comment.find({ postId: post._id });
   }
*/

/* =========================================================
   ✅ AFTER (SINGLE QUERY USING AGGREGATION)
   ========================================================= */

/**
 * @route   GET /api/posts
 * @desc    Get all posts with user + comments (NO N+1)
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const posts = await Post.aggregate([
      // Join USERS
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },

      // Join COMMENTS
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "comments",
        },
      },

      // Project only required fields
      {
        $project: {
          title: 1,
          content: 1,
          createdAt: 1,

          "author._id": 1,
          "author.username": 1,
          "author.firstName": 1,
          "author.lastName": 1,
          "author.profilePicture": 1,

          commentsCount: { $size: "$comments" },
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    res.json({
      success: true,
      data: posts,
      message: "Posts fetched successfully (N+1 fixed)",
    });
  } catch (error) {
    console.error("Fetch posts error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Error fetching posts",
    });
  }
});

/**
 * @route   GET /api/posts/:id
 * @desc    Get single post with comments + users
 * @access  Public
 */
router.get("/:id", async (req, res) => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.id);

    const post = await Post.aggregate([
      { $match: { _id: postId } },

      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },

      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "comments",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "comments.user",
          foreignField: "_id",
          as: "commentUsers",
        },
      },

      {
        $project: {
          title: 1,
          content: 1,
          createdAt: 1,
          author: {
            _id: "$author._id",
            username: "$author.username",
            profilePicture: "$author.profilePicture",
          },
          comments: {
            $map: {
              input: "$comments",
              as: "comment",
              in: {
                _id: "$$comment._id",
                content: "$$comment.content",
                createdAt: "$$comment.createdAt",
                user: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$commentUsers",
                        as: "u",
                        cond: { $eq: ["$$u._id", "$$comment.user"] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },
    ]);

    if (!post.length) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Post not found",
      });
    }

    res.json({
      success: true,
      data: post[0],
      message: "Post fetched successfully",
    });
  } catch (error) {
    console.error("Fetch post error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Error fetching post",
    });
  }
});

/**
 * @route   POST /api/posts
 * @desc    Create post
 * @access  Private
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    const post = await Post.create({
      title,
      content,
      user: req.userId,
    });

    res.status(201).json({
      success: true,
      data: post,
      message: "Post created successfully",
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Error creating post",
    });
  }
});

module.exports = router;
