/**
 * Dayflow HRMS — Sign Up API Endpoint
 * POST /api/auth/sign-up
 *
 * Security & Access Document §1 & §2 Compliance:
 * 1. Server-side Zod validation.
 * 2. Rate limiting (max 5 attempts per 15 min per IP + email).
 * 3. Server forces role = "EMPLOYEE" (Role hijacking impossible).
 * 4. Password hashed with bcryptjs (cost factor 12).
 * 5. Time-limited (24h) VerificationToken record created; User created with isVerified: false.
 * 6. Verification email triggered (stubbed via console log in dev).
 */
import { type NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { signUpSchema } from "@/lib/validators/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email/mailer";

const BCRYPT_COST = 12;
const VERIFY_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function errorResponse(message: string) {
  return { success: false, error: message };
}

function successResponse(data: Record<string, unknown>) {
  return { success: true, data };
}

export async function POST(request: NextRequest) {
  try {
    // 1. Extract IP for rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    // Parse body safely
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(errorResponse("Invalid JSON payload"), {
        status: 400,
      });
    }

    const emailForRateLimit =
      typeof body.email === "string" ? body.email.toLowerCase() : "";
    const rateLimitKey = `signup:${ip}:${emailForRateLimit}`;

    // 2. Rate Limiting Check (5 attempts / 15 min)
    const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        errorResponse(
          `Too many sign-up attempts. Please try again in ${rateLimit.resetInSeconds} seconds.`
        ),
        { status: 429 }
      );
    }

    // 3. Zod Input Validation
    const validationResult = signUpSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError =
        validationResult.error.issues[0]?.message || "Invalid input data";
      return NextResponse.json(errorResponse(firstError), { status: 400 });
    }

    const { employeeCode, firstName, lastName, email, password } =
      validationResult.data;

    // 4. Duplicate checks (Email & Employee Code)
    const existingUser = await prisma.user.findUnique({ where: { email } });
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

    // 6. Verification Token
    const verifyToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + VERIFY_TOKEN_EXPIRY_MS);

    // 7. Atomic DB Transaction
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: "EMPLOYEE", // Strictly forced server-side
          isVerified: false,
          verifyToken,
          verifyTokenExp: expiresAt,
        },
      });

      const newEmployee = await tx.employee.create({
        data: {
          userId: newUser.id,
          employeeCode,
          firstName,
          lastName,
          jobTitle: "Employee",
          department: "General",
          dateOfJoining: new Date(),
        },
      });

      return { user: newUser, employee: newEmployee };
    });

    // 8. Trigger Verification Email (Console stub when SMTP not configured)
    // IMPORTANT: email is fire-and-forget — a mailer failure MUST NOT fail
    // the sign-up response. The DB transaction has already committed.
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${appUrl}/verify-email?token=${verifyToken}&email=${encodeURIComponent(email)}`;

    try {
      await sendVerificationEmail(
        email,
        verifyToken,
        `${firstName} ${lastName}`.trim()
      );
    } catch (emailError) {
      // Log server-side but never surface to client — account is already created
      console.error(
        "[sign-up] Verification email failed (account still created):",
        emailError
      );
      // Always log the verify URL server-side for the demo stub so admins
      // can manually share it when SMTP is unconfigured.
      console.warn("[sign-up] Manual verification URL:", verifyUrl);
    }

    // 9. Response
    return NextResponse.json(
      successResponse({
        message:
          "Sign-up successful. Please check your email to verify your account.",
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          employeeCode: result.employee.employeeCode,
          isVerified: result.user.isVerified,
          // demoVerifyUrl intentionally omitted — never send tokens to client
        },
      }),
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Sign-up API error:", error);

    // Handle Prisma unique constraint violation (e.g. from race conditions or missed duplicates)
    if (error?.code === "P2002") {
      return NextResponse.json(
        errorResponse("An account with this email or Employee ID already exists"),
        { status: 400 }
      );
    }

    return NextResponse.json(
      errorResponse(
        error?.message || "An unexpected server error occurred. Please try again later."
      ),
      { status: 500 }
    );
  }
}
