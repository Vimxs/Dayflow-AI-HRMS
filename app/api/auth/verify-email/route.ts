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

    // Find user with this verifyToken
    const user = await prisma.user.findFirst({
      where: { verifyToken: token },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "This verification link is invalid or has already been used.",
        },
        { status: 400 }
      );
    }

    if (user.verifyTokenExp && user.verifyTokenExp < new Date()) {
      // Token expired — clear it
      await prisma.user.update({
        where: { id: user.id },
        data: { verifyToken: null, verifyTokenExp: null },
      });

      return NextResponse.json(
        {
          success: false,
          error: "This verification link has expired. Please request a new verification email.",
          expired: true,
          email: user.email,
        },
        { status: 400 }
      );
    }

    // Mark user as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verifyToken: null,
        verifyTokenExp: null,
      },
    });

    // Audit log
    await createAuditLog({
      actorId: user.id,
      action: "EMAIL_VERIFIED",
      entity: "User",
      entityId: user.id,
      metadata: { email: user.email },
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
