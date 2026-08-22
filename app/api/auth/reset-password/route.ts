import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/auth/password";
import { createAuditLog } from "@/lib/audit/logger";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  try {
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

    // Look up token in DB
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "This password reset link is invalid or has already been used.",
        },
        { status: 400 }
      );
    }

    if (resetRecord.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { id: resetRecord.id },
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

    // Update password, delete token, and revoke active sessions for security
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetRecord.id },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: resetRecord.userId },
        data: { isRevoked: true },
      }),
    ]);

    // Audit log
    await createAuditLog({
      actorId: resetRecord.userId,
      action: "PASSWORD_RESET_SUCCESS",
      entity: "User",
      entityId: resetRecord.userId,
      metadata: { email: resetRecord.user.email },
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
