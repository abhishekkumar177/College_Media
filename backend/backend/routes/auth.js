const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// jwt token implemented
const router = express.Router(); // 🔥 THIS WAS MISSING

// TEST ROUTE
router.get('/test', (req, res) => {
  res.json({ ok: true });
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // TEMP MOCK USER
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    password: await bcrypt.hash('Password123', 10)
  };

  if (email !== mockUser.email) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, mockUser.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: mockUser.id },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '15m' }
  );

  res.json({
    success: true,
    data: {
      token,
      id: mockUser.id,
      email: mockUser.email
    }
  });
});

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Basic validation
    if (!email || !password || !username) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email, username, and password' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create mock user (in real app, save to database)
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      password: hashedPassword
    };

    // Generate token
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Registration failed. Please try again.' 
    });
  }
});

module.exports = router;
