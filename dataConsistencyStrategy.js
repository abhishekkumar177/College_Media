/**
 * =====================================================
 * DATA CONSISTENCY STRATEGY IMPLEMENTATION
 * =====================================================
 * File: dataConsistencyStrategy.js
 *
 * Demonstrates:
 * - Strong Consistency
 * - Eventual Consistency
 *
 * Tech: Node.js + Express
 * Author: Ayaanshaikh12243
 */

const express = require("express");
const app = express();
app.use(express.json());

/**
 * =====================================================
 * IN-MEMORY DATABASE (Simulation)
 * =====================================================
 */
const db = {
  users: {},          // Strongly consistent data
  followerCache: {}   // Eventually consistent data
};

/**
 * =====================================================
 * UTILITY FUNCTIONS
 * =====================================================
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * =====================================================
 * STRONG CONSISTENCY SERVICE
 * =====================================================
 * - Used for critical data
 * - Synchronous write & read
 * - Single source of truth
 */

app.post("/api/v1/users", (req, res) => {
  const { id, username, email } = req.body;

  if (!id || !username || !email) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields"
    });
  }

  // Strongly consistent write
  db.users[id] = {
    id,
    username,
    email,
    createdAt: new Date()
  };

  // Initialize eventual data
  db.followerCache[id] = 0;

  res.status(201).json({
    success: true,
    consistency: "STRONG",
    data: db.users[id]
  });
});

app.get("/api/v1/users/:id", (req, res) => {
  const user = db.users[req.params.id];

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found"
    });
  }

  res.json({
    success: true,
    consistency: "STRONG",
    data: user
  });
});

/**
 * =====================================================
 * EVENTUAL CONSISTENCY SERVICE
 * =====================================================
 * - Used for non-critical data
 * - Async update
 * - Temporary inconsistency allowed
 */

app.post("/api/v1/users/:id/follow", async (req, res) => {
  const userId = req.params.id;

  if (!db.users[userId]) {
    return res.status(404).json({
      success: false,
      error: "User not found"
    });
  }

  // Immediate response (before update)
  res.status(202).json({
    success: true,
    consistency: "EVENTUAL",
    message: "Follow request accepted. Count will update shortly."
  });

  // Async update (eventual consistency)
  await delay(3000); // simulate queue / worker delay

  db.followerCache[userId] += 1;
  console.log(`Follower count updated for ${userId}`);
});

app.get("/api/v1/users/:id/followers", (req, res) => {
  const count = db.followerCache[req.params.id];

  if (count === undefined) {
    return res.status(404).json({
      success: false,
      error: "User not found"
    });
  }

  res.json({
    success: true,
    consistency: "EVENTUAL",
    data: {
      followers: count,
      note: "Value may lag slightly behind actual state"
    }
  });
});

/**
 * =====================================================
 * CONSISTENCY METADATA ENDPOINT
 * =====================================================
 */
app.get("/api/v1/consistency-policy", (req, res) => {
  res.json({
    strongConsistency: [
      "User profile",
      "Authentication data",
      "Sensitive updates"
    ],
    eventualConsistency: [
      "Follower count",
      "Likes",
      "Analytics",
      "Feeds"
    ],
    rule: "Critical data = STRONG, Scalable data = EVENTUAL"
  });
});

/**
 * =====================================================
 * GLOBAL ERROR HANDLER
 * =====================================================
 */
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    error: "Internal Server Error"
  });
});

/**
 * =====================================================
 * SERVER START
 * =====================================================
 */
app.listen(3000, () => {
  console.log("Data Consistency Service running on port 3000");
});

/**
 * =====================================================
 * SUMMARY
 * =====================================================
 * ✔ Strong Consistency → synchronous, reliable
 * ✔ Eventual Consistency → async, scalable
 * ✔ Clear strategy defined
 * ✔ Fixes Issue #852
 */
