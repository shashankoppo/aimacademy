import type { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../security/jwt";
import { prisma } from "../prisma";

export type AuthUser = {
  id: string;
  role: string;
  permissions: Set<string>;
};

export async function buildPermissionsForRole(roleKey: string): Promise<Set<string>> {
  const role = await prisma.role.findUnique({
    where: { key: roleKey },
    include: { rolePermissions: { include: { permission: true } } },
  });
  const perms = new Set<string>();
  if (!role) return perms;
  for (const rp of role.rolePermissions) perms.add(rp.permission.key);
  return perms;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const auth = req.header("authorization") ?? "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    res.status(401).json({ success: false, message: "Missing bearer token." });
    return;
  }

  const secret = process.env.JWT_SECRET ?? "";
  if (!secret) {
    res.status(500).json({ success: false, message: "Server misconfigured (JWT_SECRET)." });
    return;
  }

  const verified = verifyJwt(m[1], { secret });
  if (!verified.valid) {
    res.status(401).json({ success: false, message: "Invalid or expired session." });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: verified.payload.sub } });
  if (!user || !user.isActive) {
    res.status(401).json({ success: false, message: "Account disabled." });
    return;
  }

  const permissions = await buildPermissionsForRole(user.role);
  req.authUser = { id: user.id, role: user.role, permissions } satisfies AuthUser;
  next();
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const au = req.authUser as AuthUser | undefined;
    if (!au) return res.status(401).json({ success: false, message: "Unauthorized." });
    if (au.role !== role) return res.status(403).json({ success: false, message: "Forbidden." });
    next();
  };
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const au = req.authUser as AuthUser | undefined;
    if (!au) return res.status(401).json({ success: false, message: "Unauthorized." });
    if (!au.permissions.has(permission)) return res.status(403).json({ success: false, message: "Forbidden." });
    next();
  };
}
