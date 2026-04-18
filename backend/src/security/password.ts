import crypto from "crypto";

type HashParts = {
  version: "scrypt";
  params: {
    N: number;
    r: number;
    p: number;
    keyLen: number;
  };
  salt: Buffer;
  derivedKey: Buffer;
};

const DEFAULT_PARAMS = {
  // Reasonable baseline for Node on typical dev/prod boxes.
  // If you have a strict perf budget, tune after profiling.
  N: 16384,
  r: 8,
  p: 1,
  keyLen: 64,
} as const;

function b64urlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function b64urlDecode(text: string): Buffer {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((text.length + 3) % 4);
  return Buffer.from(padded, "base64");
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = crypto.randomBytes(16);
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

export function isHashedPassword(value: string): boolean {
  return value.startsWith("scrypt$");
}

export function parsePasswordHash(hash: string): HashParts | null {
  const parts = hash.split("$");
  if (parts.length !== 7) return null;
  const [version, n, r, p, keyLen, saltB64, dkB64] = parts;
  if (version !== "scrypt") return null;
  const N = Number(n);
  const rr = Number(r);
  const pp = Number(p);
  const kl = Number(keyLen);
  if (!Number.isFinite(N) || !Number.isFinite(rr) || !Number.isFinite(pp) || !Number.isFinite(kl)) return null;

  try {
    return {
      version: "scrypt",
      params: { N, r: rr, p: pp, keyLen: kl },
      salt: b64urlDecode(saltB64),
      derivedKey: b64urlDecode(dkB64),
    };
  } catch {
    return null;
  }
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const parsed = parsePasswordHash(stored);
  if (!parsed) return false;

  const candidate = await scryptDeriveKey(plain, parsed.salt, parsed.params.keyLen, {
    N: parsed.params.N,
    r: parsed.params.r,
    p: parsed.params.p,
  });

  return crypto.timingSafeEqual(candidate, parsed.derivedKey);
}

function scryptDeriveKey(
  password: string,
  salt: Buffer,
  keyLen: number,
  opts: { N: number; r: number; p: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keyLen, opts, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey as Buffer);
    });
  });
}
