import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/profile", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Protected route accessed",
    user: req.user,
  });
});

export default router;
