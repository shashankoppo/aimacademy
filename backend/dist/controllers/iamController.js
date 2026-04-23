"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPermissions = exports.listRoles = exports.resetUserPassword = exports.updateUser = exports.createUser = exports.listUsers = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../prisma");
const zod_1 = require("zod");
const password_1 = require("../security/password");
const audit_1 = require("../middleware/audit");
const roleKeySchema = zod_1.z.enum(["ADMIN", "TEACHER", "STUDENT", "STAFF"]);
const listUsers = async (_req, res) => {
    const users = await prisma_1.prisma.user.findMany({
        select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true, updatedAt: true, lastLoginAt: true },
        orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, users });
};
exports.listUsers = listUsers;
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2),
    email: zod_1.z.string().trim().email().optional(),
    phone: zod_1.z.string().trim().min(8).optional(),
    role: roleKeySchema,
    password: zod_1.z.string().min(8).optional(),
    isActive: zod_1.z.boolean().optional(),
});
const createUser = async (req, res) => {
    const payload = createUserSchema.parse(req.body);
    const tempPassword = payload.password ?? crypto_1.default.randomBytes(9).toString("base64url");
    const user = await prisma_1.prisma.user.create({
        data: {
            name: payload.name,
            email: payload.email?.toLowerCase(),
            phone: payload.phone,
            role: payload.role,
            isActive: payload.isActive ?? true,
            password: await (0, password_1.hashPassword)(tempPassword),
        },
        select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
    });
    await (0, audit_1.auditLog)({ req, action: "pam.user_created", targetType: "user", targetId: user.id, metadata: { role: user.role } });
    res.status(201).json({ success: true, user, tempPassword });
};
exports.createUser = createUser;
const updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).optional(),
    email: zod_1.z.string().trim().email().optional().nullable(),
    phone: zod_1.z.string().trim().min(8).optional().nullable(),
    role: roleKeySchema.optional(),
    isActive: zod_1.z.boolean().optional(),
});
const updateUser = async (req, res) => {
    const userId = req.params.id;
    const payload = updateUserSchema.parse(req.body);
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, isActive: true },
    });
    if (!existingUser) {
        res.status(404).json({ success: false, message: "User not found." });
        return;
    }
    const isCurrentAdmin = existingUser.role === "ADMIN" && existingUser.isActive;
    const newRole = payload.role ?? existingUser.role;
    const willRemainActive = payload.isActive ?? existingUser.isActive;
    if (isCurrentAdmin && (!willRemainActive || newRole !== "ADMIN")) {
        const activeAdminCount = await prisma_1.prisma.user.count({ where: { role: "ADMIN", isActive: true } });
        if (activeAdminCount <= 1) {
            res.status(400).json({
                success: false,
                message: "At least one active administrator must remain. This account cannot be deactivated or demoted.",
            });
            return;
        }
    }
    const updated = await prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            name: payload.name ?? undefined,
            email: payload.email === null ? null : payload.email?.toLowerCase(),
            phone: payload.phone === null ? null : payload.phone,
            role: payload.role ?? undefined,
            isActive: payload.isActive ?? undefined,
        },
        select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, updatedAt: true },
    });
    await (0, audit_1.auditLog)({ req, action: "pam.user_updated", targetType: "user", targetId: updated.id, metadata: payload });
    res.json({ success: true, user: updated });
};
exports.updateUser = updateUser;
const resetUserPassword = async (req, res) => {
    const userId = req.params.id;
    const newPassword = crypto_1.default.randomBytes(9).toString("base64url");
    await prisma_1.prisma.user.update({ where: { id: userId }, data: { password: await (0, password_1.hashPassword)(newPassword), failedLoginCount: 0, lockedUntil: null } });
    await (0, audit_1.auditLog)({ req, action: "pam.password_reset", targetType: "user", targetId: userId });
    res.json({ success: true, tempPassword: newPassword });
};
exports.resetUserPassword = resetUserPassword;
const listRoles = async (_req, res) => {
    const roles = await prisma_1.prisma.role.findMany({
        include: { rolePermissions: { include: { permission: true } } },
        orderBy: { key: "asc" },
    });
    res.json({
        success: true,
        roles: roles.map((r) => ({
            id: r.id,
            key: r.key,
            name: r.name,
            isSystem: r.isSystem,
            permissions: r.rolePermissions.map((rp) => rp.permission.key).sort(),
        })),
    });
};
exports.listRoles = listRoles;
const listPermissions = async (_req, res) => {
    const permissions = await prisma_1.prisma.permission.findMany({ orderBy: { key: "asc" } });
    res.json({ success: true, permissions });
};
exports.listPermissions = listPermissions;
