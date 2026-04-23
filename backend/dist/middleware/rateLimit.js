"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = rateLimit;
function rateLimit(opts) {
    const buckets = new Map();
    const keyFn = opts.key ?? ((req) => req.ip ?? "unknown");
    return (req, res, next) => {
        const now = Date.now();
        const key = keyFn(req);
        const current = buckets.get(key);
        if (!current || current.resetAtMs <= now) {
            buckets.set(key, { count: 1, resetAtMs: now + opts.windowMs });
            next();
            return;
        }
        current.count += 1;
        if (current.count > opts.max) {
            const retryAfterSec = Math.max(1, Math.ceil((current.resetAtMs - now) / 1000));
            res.setHeader("Retry-After", retryAfterSec.toString());
            res.status(429).json({ success: false, message: "Too many requests. Please try again later." });
            return;
        }
        next();
    };
}
