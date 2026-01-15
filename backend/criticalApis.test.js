/**
 * ============================================================
 * Critical APIs – Unit Tests (Single File Example)
 * ============================================================
 * Tech Stack:
 * - Node.js
 * - Express
 * - Jest
 * - Supertest
 *
 * Covers:
 * - Auth APIs
 * - User APIs
 * - Input validation
 * - Error handling
 * - Edge cases
 * ============================================================
 */

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

/**
 * ============================================================
 * Mock Database Layer
 * ============================================================
 */

const mockDB = {
  users: [],
};

/**
 * ============================================================
 * Mock Services
 * ============================================================
 */

const UserService = {
  createUser: jest.fn(async ({ email, password }) => {
    const user = {
      id: mockDB.users.length + 1,
      email,
      password,
    };
    mockDB.users.push(user);
    return user;
  }),

  findByEmail: jest.fn(async (email) => {
    return mockDB.users.find((u) => u.email === email);
  }),

  findById: jest.fn(async (id) => {
    return mockDB.users.find((u) => u.id === id);
  }),
};

const AuthService = {
  login: jest.fn(async (email, password) => {
    const user = mockDB.users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) return null;

    return jwt.sign(
      { id: user.id, email: user.email },
      'test-secret',
      { expiresIn: '1h' }
    );
  }),
};

/**
 * ============================================================
 * Express App Setup
 * ============================================================
 */

const app = express();
app.use(bodyParser.json());

/**
 * ============================================================
 * Middleware
 * ============================================================
 */

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'test-secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * ============================================================
 * Routes – Critical APIs
 * ============================================================
 */

/**
 * Register API
 */
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const existingUser = await UserService.findByEmail(email);
  if (existingUser) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const user = await UserService.createUser({ email, password });

  return res.status(201).json({
    id: user.id,
    email: user.email,
  });
});

/**
 * Login API
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const token = await AuthService.login(email, password);
  if (!token) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  return res.status(200).json({ token });
});

/**
 * Get Profile API (Protected)
 */
app.get('/api/users/me', authMiddleware, async (req, res) => {
  const user = await UserService.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json({
    id: user.id,
    email: user.email,
  });
});

/**
 * ============================================================
 * Unit Tests
 * ============================================================
 */

describe('Critical API Unit Tests', () => {
  beforeEach(() => {
    mockDB.users = [];
    jest.clearAllMocks();
  });

  /**
   * -------------------------
   * Register API Tests
   * -------------------------
   */

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.email).toBe('test@example.com');
    });

    it('should fail when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should fail for duplicate user', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'dup@example.com',
        password: 'pass',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'dup@example.com',
          password: 'pass',
        });

      expect(res.statusCode).toBe(409);
    });
  });

  /**
   * -------------------------
   * Login API Tests
   * -------------------------
   */

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'login@example.com',
        password: 'pass123',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'pass123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('should fail with invalid password', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'wrong@example.com',
        password: 'correct',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrong',
        });

      expect(res.statusCode).toBe(401);
    });
  });

  /**
   * -------------------------
   * Protected API Tests
   * -------------------------
   */

  describe('GET /api/users/me', () => {
    it('should return user profile for valid token', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'me@example.com',
        password: 'pass',
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'me@example.com',
          password: 'pass',
        });

      const token = loginRes.body.token;

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe('me@example.com');
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.statusCode).toBe(401);
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.statusCode).toBe(401);
    });
  });
});

/**
 * ============================================================
 * End of File
 * ============================================================
 */
