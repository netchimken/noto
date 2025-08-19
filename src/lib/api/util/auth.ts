import { env } from "$env/dynamic/private";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";

export function sha256(...values: string[]) {
  const hasher = createHash('sha256');
  for (const value of values) hasher.update(value);

  return hasher.digest().toString("hex");
}

export function getAuthSecret() {
  return env.AUTH_SECRET;
}

export function getLoginCode(secret: string, requestedAt: Date) {
  const hash = sha256(secret, requestedAt.getTime().toString());

  return hash.substring(hash.length - 6).toUpperCase();
}

export function generateSecret(bytes: number = 16) {
  return randomBytes(bytes).toString("hex");
}

export function generateValidation(
  email: string,
  requestedAt: Date,
  ttl: number,
) {
  const expiresAt = new Date(requestedAt.getTime() + 1000 * 60 * ttl);

  return jwt.sign(
    {
      exp: Math.floor(expiresAt.getTime() / 1000),
      email,
      requestedAt: requestedAt.getTime(),
      nonce: generateSecret()
    },
    getAuthSecret(),
  );
}

const sessionSchema = z.object({
  exp: z.number(),

  email: z.string(),
  name: z.string(),
  id: z.number(),
});

/**
 * This only DECODES, it DOES NOT VERIFY.
 * Use with caution.
 */
export function decodeSession(token: string) {
  const decoded = jwt.decode(token);
  const session = sessionSchema.parse(decoded);

  return session;
}

export function verifySession(token: string) {
  const decoded = jwt.verify(token, getAuthSecret());
  const session = sessionSchema.parse(decoded);

  return session;
}
