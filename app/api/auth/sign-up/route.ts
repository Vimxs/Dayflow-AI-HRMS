/**
 * Dayflow HRMS — Sign Up API Endpoint
 * POST /api/auth/sign-up
 *
 * Security & Access Document §1 & §2 Compliance:
 * 1. Server-side Zod validation.
 * 2. Rate limiting (max 5 attempts per 15 min per IP + email).
 * 3. Server forces role = "EMPLOYEE" (Role hijacking impossible).
 * 4. Password hashed with bcryptjs (cost factor 12).
 * 5. Time-limited (24h) verification token generated; User created with isVerified: false.
 * 6. Verification email triggered (stubbed via console log in dev).
 */
import { type NextRequest, NextResponse } from "next/server";
import randomBytes from "crypto";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { signUpSchema } from "@/lib/validators/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { errorResponse, successResponse } from "@/lib/validators/common";

const BCRYPT_COST = 12;
const VERIFY_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: NextRequest) {
  try {
    // 1. Extract IP for rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    
    // Parse body safely
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(errorResponse("Invalid JSON payload"), { status: 400 });
    }

    const emailForRateLimit = typeof body.email === "string" ? body.email.toLowerCase() : "";
    const rateLimitKey = `signup:${ip}:${emailForRateLimit}`;

    // 2. Rate Limiting Check (5 attempts / 15 min)
    const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        errorResponse(`Too many sign-up attempts. Please try again in ${rateLimit.resetInSeconds} seconds.`),
        { status: 429 }
      );
    }

    // 3. Zod Input Validation
    const validationResult = signUpSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || "Invalid input data";
      return NextResponse.json(errorResponse(firstError), { status: 400 });
    }

    const { employeeCode, firstName, lastName, email, password } = validationResult.data;

    // 4. Duplicate checks (Email & Employee Code)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json(
        errorResponse("An account with this email address already exists"),
        { status: 400 }
      );
    }

    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeCode },
    });
    if (existingEmployee) {
      return NextResponse.json(
        errorResponse("An employee with this Employee ID already exists"),
        { status: 400 }
      );
    }

    // 5. Password Hashing (bcryptjs cost 12)
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

    // 6. Verification Token Generation (64 hex chars, 24h expiry)
    const verifyToken = randomBytes.randomBytes(32).toString("hex");
    const verifyTokenExp = new Date(Date.now() + VERIFY_TOKEN_EXPIRY_MS);

    // 7. Atomic DB Transaction (Create User with Role.EMPLOYEE + Employee record)
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: Role.EMPLOYEE, // Strictly forced server-side
          isVerified: false,
          verifyToken,
          verifyTokenExp,
        },
      });

      const newEmployee = await tx.employee.create({
        data: {
          userId: newUser.id,
          employeeCode,
          firstName,
          lastName,
        },
      });

      return { user: newUser, employee: newEmployee };
    });

    // 8. Trigger Verification Email (Console stub in dev)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${appUrl}/verify-email?token=${verifyToken}&email=${encodeURIComponent(email)}`;

    await sendEmail({
      to: email,
      subject: "Verify your Dayflow HRMS account",
      html: `<p>Welcome to Dayflow, ${firstName}!</p><p>Please verify your account by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`,
    });

    // 9. Response
    return NextResponse.json(
      successResponse({
        message: "Sign-up successful. Please check your email to verify your account.",
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          employeeCode: result.employee.employeeCode,
          isVerified: result.user.isVerified,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    // Audit log / Error logging (never leak stack trace to client)
    console.error("Sign-up API error:", error);
    return NextResponse.json(
      errorResponse("An unexpected server error occurred. Please try again later."),
      { status: 500 }
    );
  }
}
