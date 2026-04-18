import type { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";

export async function auditLog(params: {
  req: Request;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: unknown;
}) {
  const actorUserId = params.req.authUser?.id ?? null;
  const ip = params.req.ip ?? null;
  const userAgent = params.req.header("user-agent") ?? null;
  const metadataJson = params.metadata ? JSON.stringify(params.metadata) : null;
  await prisma.auditLog.create({
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

export function attachRequestId(_req: Request, res: Response, next: NextFunction) {
  // Small observability win without changing UI behavior.
  res.setHeader("X-Request-Id", cryptoRandomId());
  next();
}

function cryptoRandomId(): string {
  // Avoid importing crypto in every file; minimal unique id is fine here.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
