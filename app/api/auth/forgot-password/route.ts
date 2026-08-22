import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { sendPasswordResetEmail } from "@/lib/email/mailer";
import crypto from "crypto";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";
    const rateLimit = checkRateLimit(`forgot-password:${ip}`, 3, 15 * 60 * 1000); // 3 requests per 15m
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": rateLimit.resetInSeconds.toString() } }
      );
    }

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

    // Log the reset URL server-side only (demo convenience when SMTP is unconfigured)
    // NEVER include token URLs in client-facing API responses
    if (emailResult?.resetUrl) {
      console.warn("[forgot-password] Manual reset URL (server-side only):", emailResult.resetUrl);
    }

    return NextResponse.json(genericSuccessResponse);
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
