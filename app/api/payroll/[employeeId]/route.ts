import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/rbac/guards";
import { prisma } from "@/lib/db/prisma";
import { updatePayrollSchema } from "@/lib/validators/payroll";

type RouteParams = { params: Promise<{ employeeId: string }> };

// GET /api/payroll/[employeeId]
// Admin: can view any employee's full payroll detail
// Employee: can only view their own payroll (ownership enforced)
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { employeeId } = await params;

    // Ownership check for non-admin users
    if (session.user.role !== "ADMIN") {
      if (session.user.employeeId !== employeeId) {
        return NextResponse.json(
          { success: false, error: "Forbidden: You can only access your own payroll" },
          { status: 403 }
        );
      }
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: { select: { email: true, role: true } },
        payroll: true,
      },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    if (!employee.payroll) {
      return NextResponse.json(
        { success: false, error: "No payroll record configured for this employee" },
        { status: 404 }
      );
    }

    // Fetch payroll audit history (admin only)
    const auditHistory =
      session.user.role === "ADMIN"
        ? await prisma.auditLog.findMany({
            where: {
              entity: "Payroll",
              entityId: employee.payroll.id,
            },
            orderBy: { createdAt: "desc" },
            take: 20,
          })
        : [];

    return NextResponse.json({
      success: true,
      data: {
        employee: {
          id: employee.id,
          employeeCode: employee.employeeCode,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.user.email,
          department: employee.department,
          jobTitle: employee.jobTitle,
          dateOfJoining: employee.dateOfJoining.toISOString(),
        },
        payroll: {
          id: employee.payroll.id,
          baseSalary: employee.payroll.baseSalary,
          allowances: employee.payroll.allowances,
          deductions: employee.payroll.deductions,
          netSalary:
            employee.payroll.baseSalary +
            employee.payroll.allowances -
            employee.payroll.deductions,
          effectiveFrom: employee.payroll.effectiveFrom.toISOString(),
          createdAt: employee.payroll.createdAt.toISOString(),
          updatedAt: employee.payroll.updatedAt.toISOString(),
        },
        auditHistory: auditHistory.map((log) => ({
          id: log.id,
          action: log.action,
          createdAt: log.createdAt.toISOString(),
          metadata: log.metadata,
        })),
      },
    });
  } catch (error) {
    console.error("Payroll GET [employeeId] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payroll detail" },
      { status: 500 }
    );
  }
}

// PATCH /api/payroll/[employeeId] — Admin only
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only Admins can modify payroll" },
        { status: 403 }
      );
    }

    const { employeeId } = await params;
    const body = await req.json();
    const parse = updatePayrollSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const existing = await prisma.payroll.findUnique({ where: { employeeId } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "No payroll record found for this employee. Create one first." },
        { status: 404 }
      );
    }

    const { baseSalary, allowances, deductions, effectiveFrom } = parse.data;

    const updated = await prisma.$transaction(async (tx) => {
      const payroll = await tx.payroll.update({
        where: { employeeId },
        data: {
          ...(baseSalary !== undefined && { baseSalary }),
          ...(allowances !== undefined && { allowances }),
          ...(deductions !== undefined && { deductions }),
          ...(effectiveFrom && { effectiveFrom: new Date(effectiveFrom) }),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.userId,
          action: "UPDATE_PAYROLL",
          entity: "Payroll",
          entityId: payroll.id,
          metadata: JSON.stringify({
            employeeId,
            changes: parse.data,
            previousValues: {
              baseSalary: existing.baseSalary,
              allowances: existing.allowances,
              deductions: existing.deductions,
              effectiveFrom: existing.effectiveFrom.toISOString(),
            },
          }),
        },
      });

      return payroll;
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Payroll updated and audit record written",
        payroll: {
          id: updated.id,
          baseSalary: updated.baseSalary,
          allowances: updated.allowances,
          deductions: updated.deductions,
          netSalary: updated.baseSalary + updated.allowances - updated.deductions,
          effectiveFrom: updated.effectiveFrom.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Payroll PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update payroll" },
      { status: 500 }
    );
  }
}

// DELETE /api/payroll/[employeeId] — Admin only
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin required" },
        { status: 403 }
      );
    }

    const { employeeId } = await params;

    const existing = await prisma.payroll.findUnique({ where: { employeeId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Payroll record not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.payroll.delete({ where: { employeeId } });
      await tx.auditLog.create({
        data: {
          actorId: session.user.userId,
          action: "DELETE_PAYROLL",
          entity: "Payroll",
          entityId: existing.id,
          metadata: JSON.stringify({
            employeeId,
            deletedRecord: {
              baseSalary: existing.baseSalary,
              allowances: existing.allowances,
              deductions: existing.deductions,
            },
          }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: { message: "Payroll record deleted and audit log written" },
    });
  } catch (error) {
    console.error("Payroll DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete payroll record" },
      { status: 500 }
    );
  }
}
