import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../prisma";
import { z } from "zod";
import { hashPassword } from "../security/password";
import { auditLog } from "../middleware/audit";

const roleKeySchema = z.enum(["ADMIN", "TEACHER", "STUDENT", "STAFF"]);

export const listUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true, updatedAt: true, lastLoginAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, users });
};

const createUserSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().min(8).optional(),
  role: roleKeySchema,
  password: z.string().min(8).optional(),
  isActive: z.boolean().optional(),
});

export const createUser = async (req: Request, res: Response) => {
  const payload = createUserSchema.parse(req.body);
  const tempPassword = payload.password ?? crypto.randomBytes(9).toString("base64url");

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email?.toLowerCase(),
      phone: payload.phone,
      role: payload.role,
      isActive: payload.isActive ?? true,
      password: await hashPassword(tempPassword),
    },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
  });

  await auditLog({ req, action: "pam.user_created", targetType: "user", targetId: user.id, metadata: { role: user.role } });
  res.status(201).json({ success: true, user, tempPassword });
};

const updateUserSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional().nullable(),
  phone: z.string().trim().min(8).optional().nullable(),
  role: roleKeySchema.optional(),
  isActive: z.boolean().optional(),
});

export const updateUser = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const payload = updateUserSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({
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
    const activeAdminCount = await prisma.user.count({ where: { role: "ADMIN", isActive: true } });
    if (activeAdminCount <= 1) {
      res.status(400).json({
        success: false,
        message: "At least one active administrator must remain. This account cannot be deactivated or demoted.",
      });
      return;
    }
  }

  const updated = await prisma.user.update({
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

  await auditLog({ req, action: "pam.user_updated", targetType: "user", targetId: updated.id, metadata: payload });
  res.json({ success: true, user: updated });
};

export const resetUserPassword = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const newPassword = crypto.randomBytes(9).toString("base64url");

  await prisma.user.update({ where: { id: userId }, data: { password: await hashPassword(newPassword), failedLoginCount: 0, lockedUntil: null } });
  await auditLog({ req, action: "pam.password_reset", targetType: "user", targetId: userId });

  res.json({ success: true, tempPassword: newPassword });
};

export const listRoles = async (_req: Request, res: Response) => {
  const roles = await prisma.role.findMany({
    include: { rolePermissions: { include: { permission: true } } },
    orderBy: { key: "asc" },
  });
  res.json({
    success: true,
    roles: roles.map((r: any) => ({
      id: r.id,
      key: r.key,
      name: r.name,
      isSystem: r.isSystem,
      permissions: r.rolePermissions.map((rp: any) => rp.permission.key).sort(),
    })),
  });
};

export const listPermissions = async (_req: Request, res: Response) => {
  const permissions = await prisma.permission.findMany({ orderBy: { key: "asc" } });
  res.json({ success: true, permissions });
};
