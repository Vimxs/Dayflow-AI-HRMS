import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "dev_access_secret_dayflow_hrms_super_secure_key_2026";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_dayflow_hrms_super_secure_key_2026";

export const ACCESS_TOKEN_EXPIRY = "15m";
export const REFRESH_TOKEN_DAYS = 7;

export const ACCESS_COOKIE_NAME = "dayflow_access_token";
export const REFRESH_COOKIE_NAME = "dayflow_refresh_token";

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  employeeId?: string;
  employeeCode?: string;
  name?: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function signRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: `${REFRESH_TOKEN_DAYS}d`,
  });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

/**
 * Creates and stores a rotated refresh token in the database
 */
export async function createAndStoreRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

/**
 * Validates and rotates an existing refresh token (implements reuse detection)
 */
export async function rotateRefreshToken(
  oldToken: string
): Promise<{ newRefreshToken: string; userId: string } | null> {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
  });

  if (!storedToken) {
    return null;
  }

  // Reuse detection: if token was already revoked, revoke all tokens for this user immediately
  if (storedToken.isRevoked || storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.updateMany({
      where: { userId: storedToken.userId },
      data: { isRevoked: true },
    });
    return null;
  }

  // Revoke old token
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { isRevoked: true },
  });

  // Issue new rotated refresh token
  const newRefreshToken = await createAndStoreRefreshToken(storedToken.userId);

  return {
    newRefreshToken,
    userId: storedToken.userId,
  };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { isRevoked: true },
  });
}

export function getAuthCookieOptions(maxAgeSeconds: number) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const, // lax allows cross-navigation while protecting CSRF
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
