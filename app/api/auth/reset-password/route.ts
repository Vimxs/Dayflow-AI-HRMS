import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/auth/password";
import { createAuditLog } from "@/lib/audit/logger";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth/jwt";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    const rateLimit = checkRateLimit(`reset-password:${ip}`, 3, 15 * 60 * 1000); // 3 requests per 15m
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": rateLimit.resetInSeconds.toString() } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const validationResult = resetPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error.issues[0]?.message || "Invalid password or token.",
        },
        { status: 400 }
      );
    }

    const { token, password } = validationResult.data;

    // Look up user by resetToken
    const user = await prisma.user.findFirst({
      where: { resetToken: token },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "This password reset link is invalid or has already been used.",
        },
        { status: 400 }
      );
    }

    if (user.resetTokenExp && user.resetTokenExp < new Date()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: null, resetTokenExp: null },
      });

      return NextResponse.json(
        {
          success: false,
          error: "This password reset link has expired. Please request a new one.",
          expired: true,
        },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(password);

    // Update password, clear token, and clear refresh token hash for security
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        resetToken: null,
        resetTokenExp: null,
        refreshTokenHash: null,
      },
    });

    // Audit log
    await createAuditLog({
      actorId: user.id,
      action: "PASSWORD_RESET",
      entity: "User",
      entityId: user.id,
      metadata: { email: user.email },
    });

    const response = NextResponse.json({
      success: true,
      message: "Your password has been successfully reset. You can now sign in with your new password.",
    });

    // Clear any existing cookies
    response.cookies.delete(ACCESS_COOKIE_NAME);
    response.cookies.delete(REFRESH_COOKIE_NAME);

    return response;
  } catch (error) {
    console.error("Reset password API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while resetting your password.",
      },
      { status: 500 }
    );
  }
}
