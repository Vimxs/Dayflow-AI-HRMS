import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/rbac/guards";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createEmployeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid corporate email is required"),
  employeeCode: z.string().min(2, "Employee code is required"),
  department: z.string().min(1, "Department is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  dateOfJoining: z.string().optional(),
  baseSalary: z.number().positive().optional(),
  role: z.enum(["ADMIN", "EMPLOYEE"]).default("EMPLOYEE"),
  password: z.string().min(8, "Initial password must be at least 8 characters").default("Dayflow@2026"),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const department = searchParams.get("department") || "ALL";

    const employees = await prisma.employee.findMany({
      where: {
        AND: [
          department !== "ALL" ? { department } : {},
          query
            ? {
                OR: [
                  { firstName: { contains: query, mode: "insensitive" } },
                  { lastName: { contains: query, mode: "insensitive" } },
                  { employeeCode: { contains: query, mode: "insensitive" } },
                  { user: { email: { contains: query, mode: "insensitive" } } },
                ],
              }
            : {},
        ],
      },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            isVerified: true,
            createdAt: true,
          },
        },
        payroll: {
          select: {
            baseSalary: true,
            allowances: true,
            deductions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        employees: employees.map((emp) => ({
          id: emp.id,
          employeeCode: emp.employeeCode,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.user.email,
          role: emp.user.role,
          department: emp.department,
          jobTitle: emp.jobTitle,
          phone: emp.phone,
          address: emp.address,
          dateOfJoining: emp.dateOfJoining.toISOString(),
          isVerified: emp.user.isVerified,
          payroll: emp.payroll
            ? {
                baseSalary: emp.payroll.baseSalary,
                allowances: emp.payroll.allowances,
                deductions: emp.payroll.deductions,
                netSalary: emp.payroll.baseSalary + emp.payroll.allowances - emp.payroll.deductions,
              }
            : null,
        })),
      },
    });
  } catch (error) {
    console.error("Admin employees GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list employees" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin required" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = createEmployeeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Check duplicate email or code
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists" },
        { status: 400 }
      );
    }

    const existingCode = await prisma.employee.findUnique({
      where: { employeeCode: data.employeeCode.toUpperCase() },
    });
    if (existingCode) {
      return NextResponse.json(
        { success: false, error: "An employee with this employee code already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const joiningDate = data.dateOfJoining ? new Date(data.dateOfJoining) : new Date();

    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          role: data.role,
          isVerified: true, // Admin-created employees are pre-verified
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeCode: data.employeeCode.toUpperCase(),
          firstName: data.firstName,
          lastName: data.lastName,
          department: data.department,
          jobTitle: data.jobTitle,
          phone: data.phone || null,
          address: data.address || null,
          dateOfJoining: joiningDate,
        },
      });

      if (data.baseSalary) {
        await tx.payroll.create({
          data: {
            employeeId: employee.id,
            baseSalary: data.baseSalary,
            allowances: 0,
            deductions: 0,
            effectiveFrom: joiningDate,
          },
        });
      }

      // Write Audit Log
      await tx.auditLog.create({
        data: {
          actorId: session.user.userId,
          action: "CREATE_EMPLOYEE",
          entity: "Employee",
          entityId: employee.id,
          metadata: JSON.stringify({
            employeeCode: employee.employeeCode,
            email: user.email,
            department: employee.department,
            role: user.role,
          }),
        },
      });

      return { user, employee };
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Employee profile created successfully",
        employee: {
          id: created.employee.id,
          employeeCode: created.employee.employeeCode,
          firstName: created.employee.firstName,
          lastName: created.employee.lastName,
          email: created.user.email,
          role: created.user.role,
        },
      },
    });
  } catch (error) {
    console.error("Create employee error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create employee profile" },
      { status: 500 }
    );
  }
}
