import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

// TEST ROUTE
router.get("/test", (req, res) => {
  res.json({ ok: true });
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // TEMP MOCK USER
    const mockUser = {
      id: "123",
      email: "test@example.com",
      password: await bcrypt.hash("Password123", 10),
      role: "user"
    };

    if (email !== mockUser.email) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, mockUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: mockUser.id,
        role: mockUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      success: true,
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

export default router;
