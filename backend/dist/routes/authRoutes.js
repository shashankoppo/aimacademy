"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
// POST /api/auth/login
router.post("/login", (0, rateLimit_1.rateLimit)({ windowMs: 60_000, max: 15 }), authController_1.login);
router.post("/refresh", (0, rateLimit_1.rateLimit)({ windowMs: 60_000, max: 60 }), authController_1.refresh);
router.post("/logout", authController_1.logout);
router.get("/me", authController_1.me);
router.post("/change-password", auth_1.authenticate, authController_1.changePassword);
router.put("/update-profile", auth_1.authenticate, authController_1.updateProfile);
exports.default = router;
