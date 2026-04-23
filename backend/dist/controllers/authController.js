"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.me = exports.logout = exports.refresh = exports.login = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../prisma");
const jwt_1 = require("../security/jwt");
const password_1 = require("../security/password");
const cookies_1 = require("../security/cookies");
const audit_1 = require("../middleware/audit");
const auth_1 = require("../middleware/auth");
const demoUsers_1 = require("../seed/demoUsers");
const ACCESS_TOKEN_TTL_SEC = 15 * 60;
const REFRESH_TOKEN_TTL_SEC = 30 * 24 * 60 * 60;
const REFRESH_COOKIE_NAME = "aim_rt";
function getCookieOptions() {
    const isProd = (process.env.NODE_ENV ?? "").toLowerCase() === "production";
    // Dev uses http; prod should run behind TLS (Secure cookies).
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/api/auth",
    };
}
function sha256Base64url(value) {
    return crypto_1.default.createHash("sha256").update(value).digest("base64url");
}
function generateRefreshToken() {
    const token = crypto_1.default.randomBytes(48).toString("base64url");
    return { token, tokenHash: sha256Base64url(token) };
}
async function issueTokensForUser(params) {
    const jwtSecret = process.env.JWT_SECRET ?? "";
    if (!jwtSecret)
        throw new Error("Missing JWT_SECRET");
    const accessToken = (0, jwt_1.createJwt)({ sub: params.userId, role: params.role }, { secret: jwtSecret, expiresInSec: ACCESS_TOKEN_TTL_SEC });
    const { token: refreshToken, tokenHash } = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SEC * 1000);
    await prisma_1.prisma.refreshToken.create({
        data: {
            userId: params.userId,
            tokenHash,
            expiresAt,
            createdByIp: params.req.ip ?? null,
            userAgent: params.req.header("user-agent") ?? null,
        },
    });
    const cookie = (0, cookies_1.serializeCookie)(REFRESH_COOKIE_NAME, refreshToken, { ...getCookieOptions(), maxAgeSec: REFRESH_TOKEN_TTL_SEC });
    params.res.setHeader("Set-Cookie", cookie);
    return accessToken;
}
const login = async (req, res) => {
    try {
        await (0, demoUsers_1.ensureDemoUsers)();
        const { email, password, role } = req.body ?? {};
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
        const normalizedRole = typeof role === "string" ? role.trim().toUpperCase() : "";
        if (!normalizedEmail || typeof password !== "string" || !normalizedRole) {
            res.status(400).json({ success: false, message: "Email, password and role are required." });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { email: normalizedEmail } });
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
        if ((0, password_1.isHashedPassword)(user.password)) {
            ok = await (0, password_1.verifyPassword)(password, user.password);
        }
        else {
            // Legacy plain-text fallback: allow login once, then upgrade to hashed.
            ok = user.password === password;
            if (ok) {
                await prisma_1.prisma.user.update({ where: { id: user.id }, data: { password: await (0, password_1.hashPassword)(password) } });
            }
        }
        if (!ok) {
            const nextFailed = user.failedLoginCount + 1;
            const lock = nextFailed >= 8 ? new Date(Date.now() + 15 * 60 * 1000) : null;
            await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: { failedLoginCount: nextFailed, lockedUntil: lock },
            });
            await (0, audit_1.auditLog)({ req, action: "auth.login_failed", targetType: "user", targetId: user.id, metadata: { email: normalizedEmail } });
            res.status(401).json({ success: false, message: "Invalid credentials." });
            return;
        }
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
        });
        const token = await issueTokensForUser({ userId: user.id, role: user.role, req, res });
        const permissions = await (0, auth_1.buildPermissionsForRole)(user.role);
        await (0, audit_1.auditLog)({ req, action: "auth.login_success", targetType: "user", targetId: user.id, metadata: { role: user.role } });
        res.status(200).json({
            success: true,
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, permissions: Array.from(permissions) },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Backend Server Error" });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const cookies = (0, cookies_1.parseCookies)(req.header("cookie"));
        const refreshToken = cookies[REFRESH_COOKIE_NAME];
        if (!refreshToken) {
            res.status(401).json({ success: false, message: "Missing refresh token." });
            return;
        }
        const tokenHash = sha256Base64url(refreshToken);
        const record = await prisma_1.prisma.refreshToken.findUnique({ where: { tokenHash } });
        if (!record || record.revokedAt || record.expiresAt.getTime() <= Date.now()) {
            res.status(401).json({ success: false, message: "Invalid session." });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { id: record.userId } });
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: "Account disabled." });
            return;
        }
        // Rotation: revoke old, issue new.
        const { token: newRefreshToken, tokenHash: newHash } = generateRefreshToken();
        const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SEC * 1000);
        const newRecord = await prisma_1.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: newHash,
                expiresAt: newExpiresAt,
                createdByIp: req.ip ?? null,
                userAgent: req.header("user-agent") ?? null,
            },
        });
        await prisma_1.prisma.refreshToken.update({
            where: { id: record.id },
            data: { revokedAt: new Date(), revokedByIp: req.ip ?? null, replacedByTokenId: newRecord.id },
        });
        const jwtSecret = process.env.JWT_SECRET ?? "";
        if (!jwtSecret)
            throw new Error("Missing JWT_SECRET");
        const accessToken = (0, jwt_1.createJwt)({ sub: user.id, role: user.role }, { secret: jwtSecret, expiresInSec: ACCESS_TOKEN_TTL_SEC });
        const cookie = (0, cookies_1.serializeCookie)(REFRESH_COOKIE_NAME, newRefreshToken, { ...getCookieOptions(), maxAgeSec: REFRESH_TOKEN_TTL_SEC });
        res.setHeader("Set-Cookie", cookie);
        res.json({ success: true, token: accessToken });
    }
    catch (error) {
        console.error("Refresh error:", error);
        res.status(500).json({ success: false, message: "Backend Server Error" });
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    try {
        const cookies = (0, cookies_1.parseCookies)(req.header("cookie"));
        const refreshToken = cookies[REFRESH_COOKIE_NAME];
        if (refreshToken) {
            const tokenHash = sha256Base64url(refreshToken);
            await prisma_1.prisma.refreshToken.updateMany({
                where: { tokenHash, revokedAt: null },
                data: { revokedAt: new Date(), revokedByIp: req.ip ?? null },
            });
        }
        const clear = (0, cookies_1.serializeCookie)(REFRESH_COOKIE_NAME, "", { ...getCookieOptions(), maxAgeSec: 0 });
        res.setHeader("Set-Cookie", clear);
        res.json({ success: true });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ success: false, message: "Backend Server Error" });
    }
};
exports.logout = logout;
const me = async (req, res) => {
    try {
        const authHeader = req.header("authorization") ?? "";
        const m = authHeader.match(/^Bearer\s+(.+)$/i);
        if (!m) {
            res.status(401).json({ success: false, message: "Missing bearer token." });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET ?? "";
        if (!jwtSecret)
            throw new Error("Missing JWT_SECRET");
        // Reuse verify logic indirectly: authenticate middleware also exists, but keep `/me` standalone.
        const { verifyJwt } = await Promise.resolve().then(() => __importStar(require("../security/jwt")));
        const verified = verifyJwt(m[1], { secret: jwtSecret });
        if (!verified.valid) {
            res.status(401).json({ success: false, message: "Invalid or expired session." });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { id: verified.payload.sub } });
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: "Account disabled." });
            return;
        }
        const permissions = await (0, auth_1.buildPermissionsForRole)(user.role);
        res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, permissions: Array.from(permissions) } });
    }
    catch (error) {
        console.error("Me error:", error);
        res.status(500).json({ success: false, message: "Backend Server Error" });
    }
};
exports.me = me;
const changePassword = async (req, res) => {
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
        const user = await prisma_1.prisma.user.findUnique({ where: { id: actorId } });
        if (!user) {
            res.status(404).json({ success: false, message: "User not found." });
            return;
        }
        const ok = (0, password_1.isHashedPassword)(user.password) ? await (0, password_1.verifyPassword)(currentPassword, user.password) : user.password === currentPassword;
        if (!ok) {
            res.status(401).json({ success: false, message: "Current password is incorrect." });
            return;
        }
        await prisma_1.prisma.user.update({ where: { id: user.id }, data: { password: await (0, password_1.hashPassword)(newPassword) } });
        await (0, audit_1.auditLog)({ req, action: "auth.password_changed", targetType: "user", targetId: user.id });
        res.json({ success: true });
    }
    catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ success: false, message: "Backend Server Error" });
    }
};
exports.changePassword = changePassword;
