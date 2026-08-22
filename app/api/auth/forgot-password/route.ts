import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { sendPasswordResetEmail } from "@/lib/email/mailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const validationResult = forgotPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    // Generic response to prevent user enumeration
    const genericSuccessResponse = {
      success: true,
      message: "If an account with that email exists, we have sent instructions to reset your password.",
    };

    if (!user) {
      return NextResponse.json(genericSuccessResponse);
    }

    // Generate 15-minute reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExp: expiresAt,
      },
    });

    const emailResult = await sendPasswordResetEmail(
      user.email,
      token,
      user.employee ? `${user.employee.firstName} ${user.employee.lastName}`.trim() : "Employee"
    );

    return NextResponse.json({
      ...genericSuccessResponse,
      resetUrl: emailResult?.resetUrl, // For developer convenience
    });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to process password reset request at this time.",
      },
      { status: 500 }
    );
  }
}
