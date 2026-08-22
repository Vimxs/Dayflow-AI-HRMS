import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyEmailSchema } from "@/lib/validators/auth";
import { createAuditLog } from "@/lib/audit/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const validationResult = verifyEmailSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing verification token.",
        },
        { status: 400 }
      );
    }

    const { token } = validationResult.data;

    // Find token in database
    const verificationRecord = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "This verification link is invalid or has already been used.",
        },
        { status: 400 }
      );
    }

    if (verificationRecord.expiresAt < new Date()) {
      // Token expired — delete it
      await prisma.verificationToken.delete({
        where: { id: verificationRecord.id },
      });

      return NextResponse.json(
        {
          success: false,
          error: "This verification link has expired. Please request a new verification email.",
          expired: true,
          email: verificationRecord.user.email,
        },
        { status: 400 }
      );
    }

    // Mark user as verified and delete used token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationRecord.userId },
        data: { isVerified: true },
      }),
      prisma.verificationToken.delete({
        where: { id: verificationRecord.id },
      }),
    ]);

    // Audit log
    await createAuditLog({
      actorId: verificationRecord.userId,
      action: "EMAIL_VERIFIED",
      entity: "User",
      entityId: verificationRecord.userId,
      metadata: { email: verificationRecord.user.email },
    });

    return NextResponse.json({
      success: true,
      message: "Your email has been verified successfully! You can now sign in to Dayflow.",
    });
  } catch (error) {
    console.error("Verify email API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred during email verification.",
      },
      { status: 500 }
    );
  }
}
