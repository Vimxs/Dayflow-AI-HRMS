import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/rbac/guards";
import { prisma } from "@/lib/db/prisma";
import { createPayrollSchema } from "@/lib/validators/payroll";

// GET /api/payroll — Admin: paginated list of all employees' payroll summary
// Employee: forbidden (use /api/payroll/[employeeId] for own record)
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Salary list is restricted to Admin" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const department = searchParams.get("department") || "ALL";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20", 10));
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        department !== "ALL" ? { department } : {},
        query
          ? {
              OR: [
                { firstName: { contains: query, mode: "insensitive" as const } },
                { lastName: { contains: query, mode: "insensitive" as const } },
                { employeeCode: { contains: query, mode: "insensitive" as const } },
              ],
            }
          : {},
      ],
    };

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { email: true, role: true } },
          payroll: {
            select: {
              id: true,
              baseSalary: true,
              allowances: true,
              deductions: true,
              effectiveFrom: true,
            },
          },
        },
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        employees: employees.map((emp) => ({
          id: emp.id,
          employeeCode: emp.employeeCode,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.user.email,
          department: emp.department,
          jobTitle: emp.jobTitle,
          hasPayroll: !!emp.payroll,
          payroll: emp.payroll
            ? {
                id: emp.payroll.id,
                baseSalary: emp.payroll.baseSalary,
                allowances: emp.payroll.allowances,
                deductions: emp.payroll.deductions,
                netSalary:
                  emp.payroll.baseSalary +
                  emp.payroll.allowances -
                  emp.payroll.deductions,
                effectiveFrom: emp.payroll.effectiveFrom.toISOString(),
              }
            : null,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Payroll list GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payroll records" },
      { status: 500 }
    );
  }
}

// POST /api/payroll — Admin only: create initial payroll for an employee
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
    const parse = createPayrollSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { employeeId, baseSalary, allowances, deductions, effectiveFrom } = parse.data;

    // Verify employee exists
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    // Check for existing payroll
    const existing = await prisma.payroll.findUnique({ where: { employeeId } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Payroll record already exists for this employee. Use PATCH to update." },
        { status: 409 }
      );
    }

    const payroll = await prisma.$transaction(async (tx) => {
      const created = await tx.payroll.create({
        data: {
          employeeId,
          baseSalary,
          allowances,
          deductions,
          effectiveFrom: new Date(effectiveFrom),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.userId,
          action: "CREATE_PAYROLL",
          entity: "Payroll",
          entityId: created.id,
          metadata: JSON.stringify({ employeeId, baseSalary, allowances, deductions, effectiveFrom }),
        },
      });

      return created;
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Payroll record created successfully",
        payroll: {
          id: payroll.id,
          employeeId: payroll.employeeId,
          baseSalary: payroll.baseSalary,
          allowances: payroll.allowances,
          deductions: payroll.deductions,
          netSalary: payroll.baseSalary + payroll.allowances - payroll.deductions,
          effectiveFrom: payroll.effectiveFrom.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Payroll POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payroll record" },
      { status: 500 }
    );
  }
}
