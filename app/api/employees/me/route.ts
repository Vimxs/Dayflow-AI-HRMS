/**
 * Dayflow HRMS — GET & PATCH /api/employees/me
 * Security & Access Document §2 & §3
 *
 * Employee self-service profile endpoint:
 * - GET: Fetch authenticated user profile, employee info, salary, and documents.
 * - PATCH: Update phone, address, and profilePictureUrl only.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthSession } from "@/lib/rbac/guards";
import { updateEmployeeSelfSchema } from "@/lib/validators/profile";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.userId },
      include: {
        employee: {
          include: {
            payroll: true,
            documents: {
              orderBy: { uploadedAt: "desc" },
            },
          },
        },
      },
    });

    if (!user || !user.employee) {
      return NextResponse.json({ success: false, error: "Employee profile not found" }, { status: 444 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.employee.id,
        userId: user.id,
        email: user.email,
        role: user.role,
        employeeCode: user.employee.employeeCode,
        firstName: user.employee.firstName,
        lastName: user.employee.lastName,
        phone: user.employee.phone,
        address: user.employee.address,
        jobTitle: user.employee.jobTitle,
        department: user.employee.department,
        dateOfJoining: user.employee.dateOfJoining,
        profilePictureUrl: user.employee.profilePictureUrl,
        payroll: user.employee.payroll,
        documents: user.employee.documents,
        createdAt: user.employee.createdAt,
        updatedAt: user.employee.updatedAt,
      },
    });
  } catch (error) {
    console.error("GET /api/employees/me error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const validationResult = updateEmployeeSelfSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const { phone, address, profilePictureUrl } = validationResult.data;

    const existingEmployee = await prisma.employee.findUnique({
      where: { userId: session.user.userId },
    });

    if (!existingEmployee) {
      return NextResponse.json({ success: false, error: "Employee profile not found" }, { status: 404 });
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: existingEmployee.id },
      data: {
        phone: phone !== undefined ? phone : existingEmployee.phone,
        address: address !== undefined ? address : existingEmployee.address,
        profilePictureUrl: profilePictureUrl !== undefined ? profilePictureUrl : existingEmployee.profilePictureUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("PATCH /api/employees/me error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
