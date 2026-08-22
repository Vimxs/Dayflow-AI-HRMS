import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/rbac/guards";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const employeeProfileUpdateSchema = z.object({
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  profilePictureUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.userId },
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
      },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: employee.id,
          employeeCode: employee.employeeCode,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.user.email,
          role: employee.user.role,
          phone: employee.phone,
          address: employee.address,
          jobTitle: employee.jobTitle,
          department: employee.department,
          dateOfJoining: employee.dateOfJoining.toISOString(),
          profilePictureUrl: employee.profilePictureUrl,
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
      },
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parseResult = employeeProfileUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { phone, address, profilePictureUrl } = parseResult.data;

    const updatedEmployee = await prisma.employee.update({
      where: { userId: session.user.userId },
      data: {
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(profilePictureUrl !== undefined && {
          profilePictureUrl: profilePictureUrl || null,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Profile updated successfully",
        employee: {
          id: updatedEmployee.id,
          phone: updatedEmployee.phone,
          address: updatedEmployee.address,
          profilePictureUrl: updatedEmployee.profilePictureUrl,
        },
      },
    });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
