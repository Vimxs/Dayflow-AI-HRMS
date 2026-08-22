/**
 * Dayflow HRMS — GET /api/employees
 * Security & Access Document §2 & §3
 *
 * Admin-only Employee Directory endpoint:
 * - Lists employees with search (name, code, department).
 * - Excludes sensitive payroll figures from list response for protection.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthSession } from "@/lib/rbac/guards";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim() || "";
    const department = searchParams.get("department")?.trim() || "";

    const whereClause: Record<string, unknown> = {};

    if (department && department !== "ALL") {
      whereClause.department = { equals: department, mode: "insensitive" };
    }

    if (query) {
      whereClause.OR = [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { employeeCode: { contains: query, mode: "insensitive" } },
        { jobTitle: { contains: query, mode: "insensitive" } },
        { user: { email: { contains: query, mode: "insensitive" } } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    console.error("GET /api/employees error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
