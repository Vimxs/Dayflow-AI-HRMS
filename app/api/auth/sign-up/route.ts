import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { signUpSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/auth/password";
import { sendVerificationEmail } from "@/lib/email/mailer";
import { createAuditLog } from "@/lib/audit/logger";
import { Role } from "@prisma/client";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Input validation
    const validationResult = signUpSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error.errors[0]?.message || "Invalid input data",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      employeeCode,
      name,
      email,
      password,
      role,
      department,
      jobTitle,
      phone,
      address,
    } = validationResult.data;

    // 2. Check duplicate email or employeeCode
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email address already exists. Please sign in instead.",
        },
        { status: 409 }
      );
    }

    const existingCode = await prisma.employee.findUnique({
      where: { employeeCode },
    });

    if (existingCode) {
      return NextResponse.json(
        {
          success: false,
          error: `Employee ID "${employeeCode}" is already assigned to another user.`,
        },
        { status: 409 }
      );
    }

    // 3. Hash password
    const passwordHash = await hashPassword(password);

    // 4. Token generation (24 hours expiry)
    const verificationTokenString = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // 5. Transaction to create user + employee + verification token
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: role === "ADMIN" ? Role.ADMIN : Role.EMPLOYEE,
          isVerified: false,
          employee: {
            create: {
              employeeCode,
              name,
              department,
              jobTitle,
              phone: phone || null,
              address: address || null,
              dateOfJoining: new Date(),
              payroll: {
                create: {
                  baseSalary: 60000,
                  allowances: 10000,
                  deductions: 5000,
                  effectiveFrom: new Date(),
                },
              },
            },
          },
          verificationTokens: {
            create: {
              token: verificationTokenString,
              expiresAt,
            },
          },
        },
        include: { employee: true },
      });

      return user;
    });

    // 6. Send verification email
    const emailResult = await sendVerificationEmail(email, verificationTokenString, name);

    // 7. Audit log
    await createAuditLog({
      actorId: result.id,
      action: "USER_SIGNUP",
      entity: "User",
      entityId: result.id,
      metadata: {
        email,
        employeeCode,
        role,
        department,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Account created successfully! We have sent a verification link to your email address.",
        data: {
          email: result.email,
          employeeCode: result.employee?.employeeCode,
          verificationUrl: emailResult?.verifyUrl, // Provided for easy dev onboarding
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sign-up API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected server error occurred during registration. Please try again.",
      },
      { status: 500 }
    );
  }
}
