"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJwt = createJwt;
exports.verifyJwt = verifyJwt;
const crypto_1 = __importDefault(require("crypto"));
function b64urlEncode(input) {
    const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
    return buf
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}
function b64urlDecodeToString(text) {
    const padded = text.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((text.length + 3) % 4);
    return Buffer.from(padded, "base64").toString("utf8");
}
function signHmacSha256(data, secret) {
    return b64urlEncode(crypto_1.default.createHmac("sha256", secret).update(data).digest());
}
function createJwt(payload, opts) {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
        ...payload,
        iat: now,
        exp: now + opts.expiresInSec,
        jti: crypto_1.default.randomUUID(),
    };
    const encodedHeader = b64urlEncode(JSON.stringify(header));
    const encodedPayload = b64urlEncode(JSON.stringify(fullPayload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signature = signHmacSha256(signingInput, opts.secret);
    return `${signingInput}.${signature}`;
}
function verifyJwt(token, opts) {
    const parts = token.split(".");
    if (parts.length !== 3)
        return { valid: false, reason: "malformed" };
    const [h, p, s] = parts;
    const signingInput = `${h}.${p}`;
    const expectedSig = signHmacSha256(signingInput, opts.secret);
    const sigBuf = Buffer.from(s);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length)
        return { valid: false, reason: "bad_signature" };
    const sigOk = crypto_1.default.timingSafeEqual(sigBuf, expBuf);
    if (!sigOk)
        return { valid: false, reason: "bad_signature" };
    let payload;
    try {
        payload = JSON.parse(b64urlDecodeToString(p));
    }
    catch {
        return { valid: false, reason: "bad_payload" };
    }
    if (!payload?.sub || !payload?.exp || !payload?.iat || !payload?.role)
        return { valid: false, reason: "bad_claims" };
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now)
        return { valid: false, reason: "expired" };
    return { valid: true, payload };
}
