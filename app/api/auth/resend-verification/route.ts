import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resendVerificationSchema } from "@/lib/validators/auth";
import { sendVerificationEmail } from "@/lib/email/mailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const validationResult = resendVerificationSchema.safeParse(body);

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

    // Always respond with a generic success message to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an unverified account exists with that email, a verification link has been sent.",
      });
    }

    if (user.isVerified) {
      return NextResponse.json({
        success: true,
        message: "This account is already verified. Please proceed to sign in.",
        alreadyVerified: true,
      });
    }

    // Remove older tokens
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate new token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const emailResult = await sendVerificationEmail(
      user.email,
      token,
      user.employee?.name || "Employee"
    );

    return NextResponse.json({
      success: true,
      message: "If an unverified account exists with that email, a verification link has been sent.",
      verificationUrl: emailResult?.verifyUrl, // Provided for dev environment convenience
    });
  } catch (error) {
    console.error("Resend verification API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to process verification request at this time.",
      },
      { status: 500 }
    );
  }
}
