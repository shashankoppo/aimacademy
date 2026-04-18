import crypto from "crypto";
import { Request, Response } from "express";
import { prisma } from "../prisma";
import { createJwt } from "../security/jwt";
import { hashPassword, isHashedPassword, verifyPassword } from "../security/password";
import { parseCookies, serializeCookie } from "../security/cookies";
import { auditLog } from "../middleware/audit";
import { buildPermissionsForRole } from "../middleware/auth";
import { ensureDemoUsers } from "../seed/demoUsers";

const ACCESS_TOKEN_TTL_SEC = 15 * 60;
const REFRESH_TOKEN_TTL_SEC = 30 * 24 * 60 * 60;
const REFRESH_COOKIE_NAME = "aim_rt";

function getCookieOptions() {
  const isProd = (process.env.NODE_ENV ?? "").toLowerCase() === "production";
  // Dev uses http; prod should run behind TLS (Secure cookies).
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/api/auth",
  };
}

function sha256Base64url(value: string): string {
  return crypto.createHash("sha256").update(value).digest("base64url");
}

function generateRefreshToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(48).toString("base64url");
  return { token, tokenHash: sha256Base64url(token) };
}

async function issueTokensForUser(params: { userId: string; role: string; req: Request; res: Response }) {
  const jwtSecret = process.env.JWT_SECRET ?? "";
  if (!jwtSecret) throw new Error("Missing JWT_SECRET");

  const accessToken = createJwt({ sub: params.userId, role: params.role }, { secret: jwtSecret, expiresInSec: ACCESS_TOKEN_TTL_SEC });

  const { token: refreshToken, tokenHash } = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SEC * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: params.userId,
      tokenHash,
      expiresAt,
      createdByIp: params.req.ip ?? null,
      userAgent: params.req.header("user-agent") ?? null,
    },
  });

  const cookie = serializeCookie(REFRESH_COOKIE_NAME, refreshToken, { ...getCookieOptions(), maxAgeSec: REFRESH_TOKEN_TTL_SEC });
  params.res.setHeader("Set-Cookie", cookie);

  return accessToken;
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureDemoUsers();

    const { email, password, role } = req.body ?? {};
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedRole = typeof role === "string" ? role.trim().toUpperCase() : "";

    if (!normalizedEmail || typeof password !== "string" || !normalizedRole) {
      res.status(400).json({ success: false, message: "Email, password and role are required." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || user.role !== normalizedRole) {
      res.status(401).json({ success: false, message: "Invalid credentials or incorrect role selected." });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: "Account disabled. Contact administrator." });
      return;
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      res.status(429).json({ success: false, message: "Account temporarily locked. Please try again later." });
      return;
    }

    let ok = false;
    if (isHashedPassword(user.password)) {
      ok = await verifyPassword(password, user.password);
    } else {
      // Legacy plain-text fallback: allow login once, then upgrade to hashed.
      ok = user.password === password;
      if (ok) {
        await prisma.user.update({ where: { id: user.id }, data: { password: await hashPassword(password) } });
      }
    }

    if (!ok) {
      const nextFailed = user.failedLoginCount + 1;
      const lock = nextFailed >= 8 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginCount: nextFailed, lockedUntil: lock },
      });
      await auditLog({ req, action: "auth.login_failed", targetType: "user", targetId: user.id, metadata: { email: normalizedEmail } });
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    const token = await issueTokensForUser({ userId: user.id, role: user.role, req, res });
    const permissions = await buildPermissionsForRole(user.role);

    await auditLog({ req, action: "auth.login_success", targetType: "user", targetId: user.id, metadata: { role: user.role } });

    res.status(200).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, permissions: Array.from(permissions) },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Backend Server Error" });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const cookies = parseCookies(req.header("cookie"));
    const refreshToken = cookies[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      res.status(401).json({ success: false, message: "Missing refresh token." });
      return;
    }

    const tokenHash = sha256Base64url(refreshToken);
    const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!record || record.revokedAt || record.expiresAt.getTime() <= Date.now()) {
      res.status(401).json({ success: false, message: "Invalid session." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: record.userId } });
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: "Account disabled." });
      return;
    }

    // Rotation: revoke old, issue new.
    const { token: newRefreshToken, tokenHash: newHash } = generateRefreshToken();
    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SEC * 1000);
    const newRecord = await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newHash,
        expiresAt: newExpiresAt,
        createdByIp: req.ip ?? null,
        userAgent: req.header("user-agent") ?? null,
      },
    });

    await prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date(), revokedByIp: req.ip ?? null, replacedByTokenId: newRecord.id },
    });

    const jwtSecret = process.env.JWT_SECRET ?? "";
    if (!jwtSecret) throw new Error("Missing JWT_SECRET");

    const accessToken = createJwt({ sub: user.id, role: user.role }, { secret: jwtSecret, expiresInSec: ACCESS_TOKEN_TTL_SEC });

    const cookie = serializeCookie(REFRESH_COOKIE_NAME, newRefreshToken, { ...getCookieOptions(), maxAgeSec: REFRESH_TOKEN_TTL_SEC });
    res.setHeader("Set-Cookie", cookie);

    res.json({ success: true, token: accessToken });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ success: false, message: "Backend Server Error" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const cookies = parseCookies(req.header("cookie"));
    const refreshToken = cookies[REFRESH_COOKIE_NAME];
    if (refreshToken) {
      const tokenHash = sha256Base64url(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date(), revokedByIp: req.ip ?? null },
      });
    }

    const clear = serializeCookie(REFRESH_COOKIE_NAME, "", { ...getCookieOptions(), maxAgeSec: 0 });
    res.setHeader("Set-Cookie", clear);

    res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Backend Server Error" });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.header("authorization") ?? "";
    const m = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!m) {
      res.status(401).json({ success: false, message: "Missing bearer token." });
      return;
    }
    const jwtSecret = process.env.JWT_SECRET ?? "";
    if (!jwtSecret) throw new Error("Missing JWT_SECRET");

    // Reuse verify logic indirectly: authenticate middleware also exists, but keep `/me` standalone.
    const { verifyJwt } = await import("../security/jwt");
    const verified = verifyJwt(m[1], { secret: jwtSecret });
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
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, permissions: Array.from(permissions) } });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ success: false, message: "Backend Server Error" });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Requires authenticate middleware (sets req.authUser).
    const actorId = req.authUser?.id;
    if (!actorId) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const { currentPassword, newPassword } = req.body ?? {};
    if (typeof currentPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 8) {
      res.status(400).json({ success: false, message: "Invalid password payload." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: actorId } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const ok = isHashedPassword(user.password) ? await verifyPassword(currentPassword, user.password) : user.password === currentPassword;
    if (!ok) {
      res.status(401).json({ success: false, message: "Current password is incorrect." });
      return;
    }

    await prisma.user.update({ where: { id: user.id }, data: { password: await hashPassword(newPassword) } });
    await auditLog({ req, action: "auth.password_changed", targetType: "user", targetId: user.id });
    res.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: "Backend Server Error" });
  }
};
