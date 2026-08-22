/**
 * Dayflow HRMS — GET /api/attendance/history
 * Security & Access Document §2
 *
 * Fetches attendance history for current employee (or target employeeId if Admin).
 * Supports date range filtering and calculates attendance statistics.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/rbac/guards";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetEmployeeId = searchParams.get("employeeId");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let employeeIdToFetch = session.user.employeeId;

    if (targetEmployeeId) {
      if (session.user.role !== "ADMIN" && targetEmployeeId !== session.user.employeeId) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
      employeeIdToFetch = targetEmployeeId;
    }

    if (!employeeIdToFetch) {
      return NextResponse.json({ success: false, error: "Employee profile not found" }, { status: 404 });
    }

    const whereClause: Record<string, unknown> = {
      employeeId: employeeIdToFetch,
    };

    if (startDateParam || endDateParam) {
      const dateFilter: Record<string, Date> = {};
      if (startDateParam) dateFilter.gte = new Date(startDateParam);
      if (endDateParam) dateFilter.lte = new Date(endDateParam);
      whereClause.date = dateFilter;
    }

    const records = await prisma.attendance.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
    });

    // Calculate statistics
    const stats = {
      totalDays: records.length,
      presentDays: records.filter((r) => r.status === "PRESENT").length,
      halfDays: records.filter((r) => r.status === "HALF_DAY").length,
      absentDays: records.filter((r) => r.status === "ABSENT").length,
      leaveDays: records.filter((r) => r.status === "LEAVE").length,
    };

    return NextResponse.json({
      success: true,
      data: {
        records,
        stats,
      },
    });
  } catch (error) {
    console.error("GET /api/attendance/history error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
