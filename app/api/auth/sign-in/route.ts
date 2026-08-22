import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { signInSchema } from "@/lib/validators/auth";
import { comparePassword } from "@/lib/auth/password";
import {
  signAccessToken,
  createAndStoreRefreshToken,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  getAuthCookieOptions,
  TokenPayload,
} from "@/lib/auth/jwt";
import { createAuditLog } from "@/lib/audit/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const validationResult = signInSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password format.",
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Look up user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    // Generic error message on failure
    const invalidCredentialsError = "Invalid email or password.";

    if (!user) {
      // Dummy compare to mitigate timing attacks
      await comparePassword("dummy-password", "$2a$10$abcdefghijklmnopqrstuvwxyz123456");
      return NextResponse.json(
        {
          success: false,
          error: invalidCredentialsError,
        },
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      await createAuditLog({
        actorId: user.id,
        action: "LOGIN_FAILED",
        entity: "User",
        entityId: user.id,
        metadata: { email, reason: "Incorrect password" },
      });

      return NextResponse.json(
        {
          success: false,
          error: invalidCredentialsError,
        },
        { status: 401 }
      );
    }

    // Check mandatory email verification
    if (!user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "Your email address has not been verified yet. Please verify your email before logging in.",
          needsVerification: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    // Build token payload
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employee?.id,
      employeeCode: user.employee?.employeeCode,
      name: user.employee?.name,
    };

    // Issue access token (15 mins) & refresh token (7 days)
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = await createAndStoreRefreshToken(user.id);

    // Audit log
    await createAuditLog({
      actorId: user.id,
      action: "LOGIN_SUCCESS",
      entity: "User",
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
    });

    const response = NextResponse.json({
      success: true,
      message: "Signed in successfully.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.employee?.name,
          employeeCode: user.employee?.employeeCode,
          jobTitle: user.employee?.jobTitle,
          department: user.employee?.department,
          profilePictureUrl: user.employee?.profilePictureUrl,
        },
        redirectTo: user.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard",
      },
    });

    // Set secure HTTP-only cookies
    response.cookies.set(
      ACCESS_COOKIE_NAME,
      accessToken,
      getAuthCookieOptions(15 * 60) // 15 minutes
    );

    response.cookies.set(
      REFRESH_COOKIE_NAME,
      refreshToken,
      getAuthCookieOptions(7 * 24 * 60 * 60) // 7 days
    );

    return response;
  } catch (error) {
    console.error("Sign-in API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred during sign-in. Please try again.",
      },
      { status: 500 }
    );
  }
}
