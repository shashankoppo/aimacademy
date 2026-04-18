import crypto from "crypto";

function b64urlEncode(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function b64urlDecodeToString(text: string): string {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((text.length + 3) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function signHmacSha256(data: string, secret: string): string {
  return b64urlEncode(crypto.createHmac("sha256", secret).update(data).digest());
}

export type JwtPayload = {
  sub: string;
  role: string;
  iat: number;
  exp: number;
  jti: string;
};

export function createJwt(payload: Omit<JwtPayload, "iat" | "exp" | "jti">, opts: { secret: string; expiresInSec: number }): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + opts.expiresInSec,
    jti: crypto.randomUUID(),
  };

  const encodedHeader = b64urlEncode(JSON.stringify(header));
  const encodedPayload = b64urlEncode(JSON.stringify(fullPayload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = signHmacSha256(signingInput, opts.secret);
  return `${signingInput}.${signature}`;
}

export function verifyJwt(token: string, opts: { secret: string }): { valid: true; payload: JwtPayload } | { valid: false; reason: string } {
  const parts = token.split(".");
  if (parts.length !== 3) return { valid: false, reason: "malformed" };
  const [h, p, s] = parts;
  const signingInput = `${h}.${p}`;
  const expectedSig = signHmacSha256(signingInput, opts.secret);

  const sigBuf = Buffer.from(s);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length) return { valid: false, reason: "bad_signature" };
  const sigOk = crypto.timingSafeEqual(sigBuf, expBuf);
  if (!sigOk) return { valid: false, reason: "bad_signature" };

  let payload: JwtPayload;
  try {
    payload = JSON.parse(b64urlDecodeToString(p)) as JwtPayload;
  } catch {
    return { valid: false, reason: "bad_payload" };
  }

  if (!payload?.sub || !payload?.exp || !payload?.iat || !payload?.role) return { valid: false, reason: "bad_claims" };

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) return { valid: false, reason: "expired" };

  return { valid: true, payload };
}
