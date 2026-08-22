/**
 * Dayflow HRMS — One-time Database Seed Endpoint
 *
 * POST /api/seed
 * Protected by SEED_SECRET env var. Run once after deploying to populate
 * the production database with demo accounts.
 *
 * Usage:
 *   curl -X POST https://your-app.vercel.app/api/seed \
 *     -H "Content-Type: application/json" \
 *     -d '{"secret": "<SEED_SECRET value>"}'
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Secret guard — must match SEED_SECRET env var
    const expectedSecret = process.env.SEED_SECRET;
    if (!expectedSecret || body.secret !== expectedSecret) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check if already seeded (admin account exists)
    const existing = await prisma.user.findUnique({ where: { email: "admin@dayflow.com" } });
    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Database already seeded. Admin account exists.",
        alreadySeeded: true,
      });
    }

    const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
    const rahulPasswordHash = await bcrypt.hash("Rahul@123", 10);
    const priyaPasswordHash = await bcrypt.hash("Priya@123", 10);

    // Admin user
    await prisma.user.create({
      data: {
        email: "admin@dayflow.com",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        isVerified: true,
        employee: {
          create: {
            employeeCode: "EMP001",
            firstName: "Anita",
            lastName: "Roy",
            phone: "+91 98765 43210",
            address: "14B Palm Grove, Cyber City, Bangalore, KA 560103",
            jobTitle: "HR Lead & Operations",
            department: "Human Resources",
            dateOfJoining: new Date("2022-03-15"),
            profilePictureUrl:
              "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            payroll: {
              create: {
                baseSalary: 120000,
                allowances: 25000,
                deductions: 12000,
                effectiveFrom: new Date("2024-01-01"),
              },
            },
          },
        },
      },
    });

    // Rahul employee
    await prisma.user.create({
      data: {
        email: "rahul@dayflow.com",
        passwordHash: rahulPasswordHash,
        role: "EMPLOYEE",
        isVerified: true,
        employee: {
          create: {
            employeeCode: "EMP002",
            firstName: "Rahul",
            lastName: "Sharma",
            phone: "+91 91234 56789",
            address: "702 Sunshine Residency, Indiranagar, Bangalore, KA 560038",
            jobTitle: "Senior Software Engineer",
            department: "Engineering",
            dateOfJoining: new Date("2023-06-01"),
            profilePictureUrl:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            payroll: {
              create: {
                baseSalary: 95000,
                allowances: 18000,
                deductions: 9500,
                effectiveFrom: new Date("2024-01-01"),
              },
            },
          },
        },
      },
    });

    // Priya employee
    await prisma.user.create({
      data: {
        email: "priya@dayflow.com",
        passwordHash: priyaPasswordHash,
        role: "EMPLOYEE",
        isVerified: true,
        employee: {
          create: {
            employeeCode: "EMP003",
            firstName: "Priya",
            lastName: "Patel",
            phone: "+91 98877 66554",
            address: "23 Lakeview Heights, Koramangala, Bangalore, KA 560034",
            jobTitle: "Product Designer",
            department: "Design",
            dateOfJoining: new Date("2023-09-15"),
            profilePictureUrl:
              "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
            payroll: {
              create: {
                baseSalary: 85000,
                allowances: 15000,
                deductions: 8000,
                effectiveFrom: new Date("2024-01-01"),
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully.",
      accounts: {
        admin: "admin@dayflow.com / Admin@123",
        employee1: "rahul@dayflow.com / Rahul@123",
        employee2: "priya@dayflow.com / Priya@123",
      },
    });
  } catch (error: unknown) {
    console.error("Seed API error:", error);
    const message = error instanceof Error ? error.message : "Seed failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
