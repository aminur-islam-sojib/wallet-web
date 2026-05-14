import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt);
const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(SALT_LENGTH);
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

  return `scrypt:${salt.toString("base64")}:${derived.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, saltBase64, hashBase64] = stored.split(":");

  if (scheme !== "scrypt" || !saltBase64 || !hashBase64) {
    return false;
  }

  const salt = Buffer.from(saltBase64, "base64");
  const hash = Buffer.from(hashBase64, "base64");
  const derived = (await scrypt(password, salt, hash.length)) as Buffer;

  return timingSafeEqual(hash, derived);
}
