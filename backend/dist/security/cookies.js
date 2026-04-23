"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCookies = parseCookies;
exports.serializeCookie = serializeCookie;
function parseCookies(cookieHeader) {
    if (!cookieHeader)
        return {};
    const out = {};
    const parts = cookieHeader.split(";");
    for (const part of parts) {
        const idx = part.indexOf("=");
        if (idx === -1)
            continue;
        const key = part.slice(0, idx).trim();
        const value = part.slice(idx + 1).trim();
        if (!key)
            continue;
        out[key] = decodeURIComponent(value);
    }
    return out;
}
function serializeCookie(name, value, opts = {}) {
    const parts = [`${name}=${encodeURIComponent(value)}`];
    if (opts.maxAgeSec != null)
        parts.push(`Max-Age=${Math.floor(opts.maxAgeSec)}`);
    if (opts.path)
        parts.push(`Path=${opts.path}`);
    if (opts.httpOnly)
        parts.push("HttpOnly");
    if (opts.secure)
        parts.push("Secure");
    if (opts.sameSite)
        parts.push(`SameSite=${opts.sameSite[0].toUpperCase()}${opts.sameSite.slice(1)}`);
    return parts.join("; ");
}
