import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";

const router = Router();

/* ======================
   TEST ROUTE
====================== */
router.get("/test", (req, res) => {
  res.json({ ok: true });
});

/* ======================
   LOGIN ROUTE
====================== */
router.post(
  "/login",

  // 🔒 INPUT VALIDATION
  [
    body("email")
      .isEmail()
      .withMessage("Valid email is required"),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
  ],

  async (req, res) => {
    try {
      // 🚫 VALIDATION RESULT CHECK
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array().map(err => err.msg) // ✅ FIXED
        });
      }

      const { email, password } = req.body;

      // 🧪 TEMP MOCK USER
      const mockUser = {
        id: "123",
        email: "test@example.com",
        password: await bcrypt.hash("Password123", 10),
        role: "user"
      };

      // ❌ INVALID EMAIL
      if (email !== mockUser.email) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }

      // ❌ INVALID PASSWORD
      const isMatch = await bcrypt.compare(password, mockUser.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }

      // 🔑 JWT TOKEN
      const token = jwt.sign(
        {
          userId: mockUser.id,
          role: mockUser.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      return res.status(200).json({
        success: true,
        token
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Login failed"
      });
    }
  }
);

export default router;
