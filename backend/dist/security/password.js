"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.isHashedPassword = isHashedPassword;
exports.parsePasswordHash = parsePasswordHash;
exports.verifyPassword = verifyPassword;
const crypto_1 = __importDefault(require("crypto"));
const DEFAULT_PARAMS = {
    // Reasonable baseline for Node on typical dev/prod boxes.
    // If you have a strict perf budget, tune after profiling.
    N: 16384,
    r: 8,
    p: 1,
    keyLen: 64,
};
function b64urlEncode(buf) {
    return buf
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}
function b64urlDecode(text) {
    const padded = text.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((text.length + 3) % 4);
    return Buffer.from(padded, "base64");
}
async function hashPassword(plain) {
    const salt = crypto_1.default.randomBytes(16);
    const derivedKey = await scryptDeriveKey(plain, salt, DEFAULT_PARAMS.keyLen, {
        N: DEFAULT_PARAMS.N,
        r: DEFAULT_PARAMS.r,
        p: DEFAULT_PARAMS.p,
    });
    // Format: scrypt$N$r$p$keyLen$saltB64url$dkB64url
    return [
        "scrypt",
        DEFAULT_PARAMS.N,
        DEFAULT_PARAMS.r,
        DEFAULT_PARAMS.p,
        DEFAULT_PARAMS.keyLen,
        b64urlEncode(salt),
        b64urlEncode(derivedKey),
    ].join("$");
}
function isHashedPassword(value) {
    return value.startsWith("scrypt$");
}
function parsePasswordHash(hash) {
    const parts = hash.split("$");
    if (parts.length !== 7)
        return null;
    const [version, n, r, p, keyLen, saltB64, dkB64] = parts;
    if (version !== "scrypt")
        return null;
    const N = Number(n);
    const rr = Number(r);
    const pp = Number(p);
    const kl = Number(keyLen);
    if (!Number.isFinite(N) || !Number.isFinite(rr) || !Number.isFinite(pp) || !Number.isFinite(kl))
        return null;
    try {
        return {
            version: "scrypt",
            params: { N, r: rr, p: pp, keyLen: kl },
            salt: b64urlDecode(saltB64),
            derivedKey: b64urlDecode(dkB64),
        };
    }
    catch {
        return null;
    }
}
async function verifyPassword(plain, stored) {
    const parsed = parsePasswordHash(stored);
    if (!parsed)
        return false;
    const candidate = await scryptDeriveKey(plain, parsed.salt, parsed.params.keyLen, {
        N: parsed.params.N,
        r: parsed.params.r,
        p: parsed.params.p,
    });
    return crypto_1.default.timingSafeEqual(candidate, parsed.derivedKey);
}
function scryptDeriveKey(password, salt, keyLen, opts) {
    return new Promise((resolve, reject) => {
        crypto_1.default.scrypt(password, salt, keyLen, opts, (err, derivedKey) => {
            if (err)
                reject(err);
            else
                resolve(derivedKey);
        });
    });
}
