import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

dotenv.config();

const router = express.Router();

/* =========================
   REGISTER
========================= */

router.post("/register", async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {

    const userExists = await User.findOne({ $or: [ { email }, { username } ] });
    if (userExists) {
      if (userExists.email === email) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      if (userExists.username === username) {
        return res.status(400).json({ message: "Username already taken" });
      }
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    // Send Welcome Email
    await sendEmail({
      to: email,
      subject: "Welcome to College Media 🚀",
      html: `
        <h2>Hello ${name} 👋</h2>
        <p>Welcome to <b>College Media</b>.</p>
        <p>You can now start connecting with your college community.</p>
        <br/>
        <p>— Team College Media</p>
      `,
    });

    res.status(201).json({
      success: true,
      message: "User registered & email sent",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   LOGOUT
========================= */
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

/* =========================
   PROFILE
========================= */
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
