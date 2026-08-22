/**
 * Dayflow HRMS — JWT utilities
 * Architecture doc §3: lib/auth/
 * Security doc §1: access token 15 min, refresh token 7 days
 *
 * STUB: Types and constants. Full implementation in T1.4.
 */
export const JWT_CONFIG = {
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
} as const;

export interface JwtPayload {
  sub: string;       // User ID
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  iat?: number;
  exp?: number;
}

// TODO (T1.4): Implement signAccessToken, signRefreshToken, verifyToken
// using jsonwebtoken + process.env.JWT_SECRET / JWT_REFRESH_SECRET
