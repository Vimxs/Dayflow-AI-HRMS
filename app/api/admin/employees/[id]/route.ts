import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/rbac/guards";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const adminUpdateEmployeeSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  jobTitle: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  dateOfJoining: z.string().optional(),
  baseSalary: z.number().positive().optional(),
  allowances: z.number().min(0).optional(),
  deductions: z.number().min(0).optional(),
  role: z.enum(["ADMIN", "EMPLOYEE"]).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin required" }, { status: 403 });
    }

    const { id } = await params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            isVerified: true,
            createdAt: true,
          },
        },
        payroll: true,
        documents: {
          orderBy: { uploadedAt: "desc" },
        },
        attendances: {
          orderBy: { date: "desc" },
          take: 10,
        },
        leaveRequests: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    // Fetch audit history for this employee
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        OR: [{ entityId: employee.id }, { actorId: employee.userId }],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        employee: {
          id: employee.id,
          employeeCode: employee.employeeCode,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.user.email,
          role: employee.user.role,
          department: employee.department,
          jobTitle: employee.jobTitle,
          phone: employee.phone,
          address: employee.address,
          profilePictureUrl: employee.profilePictureUrl,
          dateOfJoining: employee.dateOfJoining.toISOString(),
          isVerified: employee.user.isVerified,
          createdAt: employee.createdAt.toISOString(),
        },
        payroll: employee.payroll
          ? {
              id: employee.payroll.id,
              baseSalary: employee.payroll.baseSalary,
              allowances: employee.payroll.allowances,
              deductions: employee.payroll.deductions,
              netSalary:
                employee.payroll.baseSalary +
                employee.payroll.allowances -
                employee.payroll.deductions,
              effectiveFrom: employee.payroll.effectiveFrom.toISOString(),
            }
          : null,
        documents: employee.documents.map((doc) => ({
          id: doc.id,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          docType: doc.docType,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          uploadedAt: doc.uploadedAt.toISOString(),
        })),
        attendances: employee.attendances.map((a) => ({
          id: a.id,
          date: a.date.toISOString(),
          status: a.status,
          checkIn: a.checkIn?.toISOString() || null,
          checkOut: a.checkOut?.toISOString() || null,
        })),
        leaveRequests: employee.leaveRequests.map((l) => ({
          id: l.id,
          leaveType: l.leaveType,
          startDate: l.startDate.toISOString(),
          endDate: l.endDate.toISOString(),
          status: l.status,
          remarks: l.remarks,
        })),
        auditLogs: auditLogs.map((log) => ({
          id: log.id,
          action: log.action,
          entity: log.entity,
          createdAt: log.createdAt.toISOString(),
          metadata: log.metadata,
        })),
      },
    });
  } catch (error) {
    console.error("Admin employee details GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch employee details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parseResult = adminUpdateEmployeeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
      include: { payroll: true, user: true },
    });

    if (!existingEmployee) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Update employee table fields
      await tx.employee.update({
        where: { id },
        data: {
          ...(data.firstName && { firstName: data.firstName }),
          ...(data.lastName && { lastName: data.lastName }),
          ...(data.department && { department: data.department }),
          ...(data.jobTitle && { jobTitle: data.jobTitle }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.address !== undefined && { address: data.address }),
          ...(data.dateOfJoining && { dateOfJoining: new Date(data.dateOfJoining) }),
        },
      });

      // Update role if changed
      if (data.role && data.role !== existingEmployee.user.role) {
        await tx.user.update({
          where: { id: existingEmployee.userId },
          data: { role: data.role },
        });
      }

      // Update payroll if salary fields provided
      if (
        data.baseSalary !== undefined ||
        data.allowances !== undefined ||
        data.deductions !== undefined
      ) {
        if (existingEmployee.payroll) {
          await tx.payroll.update({
            where: { employeeId: id },
            data: {
              ...(data.baseSalary !== undefined && { baseSalary: data.baseSalary }),
              ...(data.allowances !== undefined && { allowances: data.allowances }),
              ...(data.deductions !== undefined && { deductions: data.deductions }),
            },
          });
        } else if (data.baseSalary) {
          await tx.payroll.create({
            data: {
              employeeId: id,
              baseSalary: data.baseSalary,
              allowances: data.allowances || 0,
              deductions: data.deductions || 0,
              effectiveFrom: new Date(),
            },
          });
        }
      }

      // Write Audit Log per Security Doc §2
      await tx.auditLog.create({
        data: {
          actorId: session.user.userId,
          action: "UPDATE_EMPLOYEE_PROFILE",
          entity: "Employee",
          entityId: id,
          metadata: JSON.stringify({
            updatedFields: Object.keys(data),
            changes: data,
          }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: { message: "Employee profile successfully updated by Administrator" },
    });
  } catch (error) {
    console.error("Admin update employee error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update employee profile" },
      { status: 500 }
    );
  }
}
