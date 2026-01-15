/**
 * ============================================================
 * DATABASE INDEX OPTIMIZATION – NODE.JS (MONGODB + MONGOOSE)
 * Issue: No Database Index Optimization (#696)
 * ============================================================
 */

'use strict';

const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

/* ============================================================
   DATABASE CONNECTION
============================================================ */
mongoose.connect('mongodb://127.0.0.1:27017/college_media', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

/* ============================================================
   USER SCHEMA WITH INDEXES
============================================================ */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      index: true, // frequently searched
    },
    email: {
      type: String,
      unique: true,
      index: true, // login & lookup
    },
    role: {
      type: String,
      index: true, // filtering
    },
    isActive: {
      type: Boolean,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true, // sorting
    },
  },
  { timestamps: true }
);

// compound index for common query pattern
userSchema.index({ role: 1, isActive: 1 });

// text index for search
userSchema.index({ name: 'text', email: 'text' });

const User = mongoose.model('User', userSchema);

/* ============================================================
   POST SCHEMA WITH INDEXES
============================================================ */
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true, // join key
    },
    status: {
      type: String,
      index: true,
    },
    tags: {
      type: [String],
      index: true,
    },
  },
  { timestamps: true }
);

// compound index for feed queries
postSchema.index({ authorId: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

/* ============================================================
   ROUTES
============================================================ */

// create user
app.post('/users', async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
});

// indexed query (email)
app.get('/users/email/:email', async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  res.json(user);
});

// indexed filter + sort
app.get('/users', async (req, res) => {
  const users = await User.find({
    role: req.query.role,
    isActive: true,
  }).sort({ createdAt: -1 });

  res.json(users);
});

// create post
app.post('/posts', async (req, res) => {
  const post = await Post.create(req.body);
  res.status(201).json(post);
});

// indexed join + sort
app.get('/posts/author/:id', async (req, res) => {
  const posts = await Post.find({ authorId: req.params.id })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json(posts);
});

// text search (uses text index)
app.get('/search', async (req, res) => {
  const result = await User.find({
    $text: { $search: req.query.q },
  });

  res.json(result);
});

/* ============================================================
   HEALTH
============================================================ */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'down',
  });
});

/* ============================================================
   SERVER
============================================================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 DB Index Optimized server running on ${PORT}`);
});
