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
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  res.json({
    success: true,
    token
  });
});

module.exports = router;
