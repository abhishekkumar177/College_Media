/**
 * ============================================================
 * Brute-Force Protected Authentication API (Single File)
 * ============================================================
 * Issue Addressed:
 * ❌ No Brute-Force Detection on API
 *
 * Features Implemented:
 * ✔ Rate limiting
 * ✔ Failed attempt tracking
 * ✔ Temporary account lockout
 * ✔ IP + user based detection
 * ✔ Secure responses
 *
 * Tech Stack:
 * - Node.js
 * - Express
 * ============================================================
 */

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

/**
 * ============================================================
 * Configuration
 * ============================================================
 */

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

/**
 * ============================================================
 * In-Memory Stores (Demo Purpose)
 * ============================================================
 */

const users = [
  { id: 1, email: 'user@example.com', password: 'password123' },
];

const failedAttempts = {}; // key: email, value: { count, lockedUntil }
const rateLimitStore = {}; // key: ip, value: { count, windowStart }

/**
 * ============================================================
 * Utility Functions
 * ============================================================
 */

function hash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function isAccountLocked(email) {
  const record = failedAttempts[email];
  if (!record) return false;

  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    return true;
  }

  return false;
}

function recordFailedAttempt(email) {
  if (!failedAttempts[email]) {
    failedAttempts[email] = { count: 1 };
  } else {
    failedAttempts[email].count += 1;
  }

  if (failedAttempts[email].count >= MAX_FAILED_ATTEMPTS) {
    failedAttempts[email].lockedUntil = Date.now() + LOCKOUT_TIME_MS;
  }
}

function resetFailedAttempts(email) {
  delete failedAttempts[email];
}

/**
 * ============================================================
 * Rate Limiting Middleware (IP Based)
 * ============================================================
 */

function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = {
      count: 1,
      windowStart: now,
    };
    return next();
  }

  const elapsed = now - rateLimitStore[ip].windowStart;

  if (elapsed > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore[ip] = {
      count: 1,
      windowStart: now,
    };
    return next();
  }

  rateLimitStore[ip].count += 1;

  if (rateLimitStore[ip].count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Too many requests. Please try again later.',
    });
  }

  next();
}

/**
 * ============================================================
 * Authentication API (Protected)
 * ============================================================
 */

app.post('/api/auth/login', rateLimiter, (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required',
    });
  }

  // Check account lock
  if (isAccountLocked(email)) {
    return res.status(423).json({
      error: 'Account temporarily locked due to multiple failed attempts',
    });
  }

  const user = users.find((u) => u.email === email);

  // Invalid email or password
  if (!user || user.password !== password) {
    recordFailedAttempt(email);

    return res.status(401).json({
      error: 'Invalid email or password',
    });
  }

  // Successful login
  resetFailedAttempts(email);

  return res.status(200).json({
    message: 'Login successful',
    userId: user.id,
  });
});

/**
 * ============================================================
 * OTP Verification API (Brute-Force Protected)
 * ============================================================
 */

const otpStore = {
  'user@example.com': '123456',
};

app.post('/api/auth/verify-otp', rateLimiter, (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      error: 'Email and OTP are required',
    });
  }

  if (isAccountLocked(email)) {
    return res.status(423).json({
      error: 'Account locked due to suspicious activity',
    });
  }

  if (otpStore[email] !== otp) {
    recordFailedAttempt(email);

    return res.status(401).json({
      error: 'Invalid OTP',
    });
  }

  resetFailedAttempts(email);

  return res.status(200).json({
    message: 'OTP verified successfully',
  });
});

/**
 * ============================================================
 * Password Reset API (Protected)
 * ============================================================
 */

app.post('/api/auth/reset-password', rateLimiter, (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({
      error: 'Email and new password required',
    });
  }

  if (isAccountLocked(email)) {
    return res.status(423).json({
      error: 'Account locked. Try again later.',
    });
  }

  const user = users.find((u) => u.email === email);

  if (!user) {
    recordFailedAttempt(email);
    return res.status(404).json({
      error: 'User not found',
    });
  }

  user.password = newPassword;
  resetFailedAttempts(email);

  return res.status(200).json({
    message: 'Password reset successful',
  });
});

/**
 * ============================================================
 * Admin / Debug Endpoint (Visibility)
 * ============================================================
 */

app.get('/debug/bruteforce-state', (req, res) => {
  return res.status(200).json({
    failedAttempts,
    rateLimitStore,
  });
});

/**
 * ============================================================
 * Server Start (Optional)
 * ============================================================
 */

// Uncomment for local testing
// app.listen(3000, () => {
//   console.log('Server running on port 3000');
// });

module.exports = app;

/**
 * ============================================================
 * End of File
 * ============================================================
 */
