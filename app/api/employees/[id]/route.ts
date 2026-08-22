/**
 * Dayflow HRMS — GET & PATCH /api/employees/[id]
 * Security & Access Document §2 & §6
 *
 * Employee Detail & Admin Edit Endpoint:
 * - GET: Restricted to Admin or Employee owner.
 * - PATCH: Admin-only update of any employee profile with mandatory AuditLog record.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthSession } from "@/lib/rbac/guards";
import { updateEmployeeAdminSchema } from "@/lib/validators/profile";
import { createAuditLog } from "@/lib/audit/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isVerified: true,
            createdAt: true,
          },
        },
        payroll: session.user.role === "ADMIN" || session.user.employeeId === id,
        documents: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    // Role check: only owner or Admin can view detail
    if (session.user.role !== "ADMIN" && session.user.employeeId !== id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("GET /api/employees/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession(req);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const validationResult = updateEmployeeAdminSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const existingEmployee = await prisma.employee.findUnique({ where: { id } });
    if (!existingEmployee) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    const updateData = validationResult.data;

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        jobTitle: updateData.jobTitle,
        department: updateData.department,
        dateOfJoining: updateData.dateOfJoining,
        phone: updateData.phone,
        address: updateData.address,
        profilePictureUrl: updateData.profilePictureUrl,
      },
    });

    // Audit Log: Admin updated employee profile (Security doc §6)
    await createAuditLog({
      actorId: session.user.userId,
      action: "UPDATE_EMPLOYEE_PROFILE",
      entity: "Employee",
      entityId: id,
      metadata: {
        before: {
          firstName: existingEmployee.firstName,
          lastName: existingEmployee.lastName,
          jobTitle: existingEmployee.jobTitle,
          department: existingEmployee.department,
          phone: existingEmployee.phone,
          address: existingEmployee.address,
        },
        after: {
          firstName: updatedEmployee.firstName,
          lastName: updatedEmployee.lastName,
          jobTitle: updatedEmployee.jobTitle,
          department: updatedEmployee.department,
          phone: updatedEmployee.phone,
          address: updatedEmployee.address,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Employee profile updated successfully by Admin",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("PATCH /api/employees/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
