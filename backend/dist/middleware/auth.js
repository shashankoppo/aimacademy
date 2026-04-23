"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPermissionsForRole = buildPermissionsForRole;
exports.authenticate = authenticate;
exports.requireRole = requireRole;
exports.requirePermission = requirePermission;
const jwt_1 = require("../security/jwt");
const prisma_1 = require("../prisma");
async function buildPermissionsForRole(roleKey) {
    const role = await prisma_1.prisma.role.findUnique({
        where: { key: roleKey },
        include: { rolePermissions: { include: { permission: true } } },
    });
    const perms = new Set();
    if (!role)
        return perms;
    for (const rp of role.rolePermissions)
        perms.add(rp.permission.key);
    return perms;
}
async function authenticate(req, res, next) {
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
    const verified = (0, jwt_1.verifyJwt)(m[1], { secret });
    if (!verified.valid) {
        res.status(401).json({ success: false, message: "Invalid or expired session." });
        return;
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { id: verified.payload.sub } });
    if (!user || !user.isActive) {
        res.status(401).json({ success: false, message: "Account disabled." });
        return;
    }
    const permissions = await buildPermissionsForRole(user.role);
    req.authUser = { id: user.id, role: user.role, permissions };
    next();
}
function requireRole(role) {
    return (req, res, next) => {
        const au = req.authUser;
        if (!au)
            return res.status(401).json({ success: false, message: "Unauthorized." });
        if (au.role !== role)
            return res.status(403).json({ success: false, message: "Forbidden." });
        next();
    };
}
function requirePermission(permission) {
    return (req, res, next) => {
        const au = req.authUser;
        if (!au)
            return res.status(401).json({ success: false, message: "Unauthorized." });
        if (!au.permissions.has(permission))
            return res.status(403).json({ success: false, message: "Forbidden." });
        next();
    };
}
