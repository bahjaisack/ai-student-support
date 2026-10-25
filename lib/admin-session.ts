import { createHash, randomBytes } from "node:crypto";
import clientPromise from "@/lib/mongodb";

export const ADMIN_SESSION_COOKIE = "dugsiiye_admin_session";

const SESSION_DURATION_SECONDS = 8 * 60 * 60;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) =>
      part.startsWith(`${ADMIN_SESSION_COOKIE}=`)
    );

  if (!cookie) return null;

  const token = cookie.slice(ADMIN_SESSION_COOKIE.length + 1);

  return /^[a-f0-9]{64}$/.test(token) ? token : null;
}

function cookieOptions(maxAge: number): string {
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `HttpOnly; Path=/; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

export function createSessionCookie(token: string): string {
  return `${ADMIN_SESSION_COOKIE}=${token}; ${cookieOptions(
    SESSION_DURATION_SECONDS
  )}`;
}

export function clearSessionCookie(): string {
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${ADMIN_SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure}`;
}

export async function createAdminSession(): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + SESSION_DURATION_SECONDS * 1000
  );

  const client = await clientPromise;
  const db = client.db("dugsiiye_support");

  await db.collection("admin_sessions").insertOne({
    tokenHash,
    createdAt: now,
    expiresAt,
  });

  return token;
}

export async function verifyAdminSession(
  request: Request
): Promise<boolean> {
  const token = getSessionToken(request);

  if (!token) return false;

  const client = await clientPromise;
  const db = client.db("dugsiiye_support");

  const session = await db.collection("admin_sessions").findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  });

  return session !== null;
}

export async function revokeAdminSession(
  request: Request
): Promise<void> {
  const token = getSessionToken(request);

  if (!token) return;

  const client = await clientPromise;
  const db = client.db("dugsiiye_support");

  await db.collection("admin_sessions").deleteOne({
    tokenHash: hashToken(token),
  });
}
