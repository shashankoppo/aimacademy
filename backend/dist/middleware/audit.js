"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = auditLog;
exports.attachRequestId = attachRequestId;
const prisma_1 = require("../prisma");
async function auditLog(params) {
    const actorUserId = params.req.authUser?.id ?? null;
    const ip = params.req.ip ?? null;
    const userAgent = params.req.header("user-agent") ?? null;
    const metadataJson = params.metadata ? JSON.stringify(params.metadata) : null;
    await prisma_1.prisma.auditLog.create({
        data: {
            actorUserId,
            action: params.action,
            targetType: params.targetType ?? null,
            targetId: params.targetId ?? null,
            metadataJson,
            ip,
            userAgent,
        },
    });
}
function attachRequestId(_req, res, next) {
    // Small observability win without changing UI behavior.
    res.setHeader("X-Request-Id", cryptoRandomId());
    next();
}
function cryptoRandomId() {
    // Avoid importing crypto in every file; minimal unique id is fine here.
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
