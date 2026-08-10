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

  if (payload.role === "TEACHER") {
    await prisma.teacherProfile.create({
      data: {
        userId: user.id,
        subjects: "",
      },
    });
  } else if (payload.role === "STUDENT") {
    await prisma.studentProfile.create({
      data: {
        userId: user.id,
      },
    });
  }

  await auditLog({ req, action: "pam.user_created", targetType: "user", targetId: user.id, metadata: { role: user.role } });
  res.status(201).json({ success: true, user, tempPassword });
};

const updateUserSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional().nullable(),
  phone: z.string().trim().min(8).optional().nullable(),
  role: roleKeySchema.optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
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
      ...(payload.password ? { password: await hashPassword(payload.password) } : {}),
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

const createRoleSchema = z.object({
  name: z.string().trim().min(2),
  key: z.string().trim().min(2),
  permissions: z.array(z.string()).optional(),
});

export const createRole = async (req: Request, res: Response) => {
  const payload = createRoleSchema.parse(req.body);
  const existing = await prisma.role.findUnique({ where: { key: payload.key } });
  if (existing) {
    return res.status(400).json({ success: false, message: "Role key already exists." });
  }

  const role = await prisma.$transaction(async (tx: any) => {
    const r = await tx.role.create({
      data: {
        key: payload.key.toUpperCase(),
        name: payload.name,
        isSystem: false,
      },
    });

    if (payload.permissions && payload.permissions.length > 0) {
      const perms = await tx.permission.findMany({ where: { key: { in: payload.permissions } } });
      for (const p of perms) {
        await tx.rolePermission.create({
          data: { roleId: r.id, permissionId: p.id },
        });
      }
    }
    return r;
  });

  await auditLog({ req, action: "pam.role_created", targetType: "role", targetId: role.id });
  res.status(201).json({ success: true, role });
};

const updateRoleSchema = z.object({
  name: z.string().trim().min(2).optional(),
  permissions: z.array(z.string()),
});

export const updateRolePermissions = async (req: Request, res: Response) => {
  const roleId = req.params.id;
  const payload = updateRoleSchema.parse(req.body);

  const existing = await prisma.role.findUnique({ where: { id: roleId } });
  if (!existing) return res.status(404).json({ success: false, message: "Role not found." });

  await prisma.$transaction(async (tx: any) => {
    if (payload.name) {
      await tx.role.update({ where: { id: roleId }, data: { name: payload.name } });
    }

    // Delete old role permissions
    await tx.rolePermission.deleteMany({ where: { roleId } });

    // Insert new role permissions
    if (payload.permissions.length > 0) {
      const perms = await tx.permission.findMany({ where: { key: { in: payload.permissions } } });
      for (const p of perms) {
        await tx.rolePermission.create({
          data: { roleId, permissionId: p.id },
        });
      }
    }
  });

  await auditLog({ req, action: "pam.role_updated", targetType: "role", targetId: roleId });
  res.json({ success: true });
};
