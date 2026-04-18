import { Router } from "express";
import { requirePermission } from "../middleware/auth";
import { createUser, listPermissions, listRoles, listUsers, resetUserPassword, updateUser } from "../controllers/iamController";

const router = Router();

router.use(requirePermission("pam:manage_users"));

router.get("/users", listUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.post("/users/:id/reset-password", resetUserPassword);

router.get("/roles", listRoles);
router.get("/permissions", listPermissions);

export default router;

