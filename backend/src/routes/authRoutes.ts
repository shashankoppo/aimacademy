import { Router } from "express";
import { changePassword, login, logout, me, refresh } from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { rateLimit } from "../middleware/rateLimit";

const router = Router();

// POST /api/auth/login
router.post("/login", rateLimit({ windowMs: 60_000, max: 15 }), login);
router.post("/refresh", rateLimit({ windowMs: 60_000, max: 60 }), refresh);
router.post("/logout", logout);
router.get("/me", me);
router.post("/change-password", authenticate, changePassword);

export default router;
