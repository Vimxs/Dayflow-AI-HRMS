/**
 * Dayflow HRMS — GET /api/admin/attendance
 * Security & Access Document §2 & §6
 *
 * Admin-only Master Attendance Endpoint:
 * - Fetches attendance records across all employees.
 * - Supports filtering by employeeId, date range (startDate, endDate), and status.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/rbac/guards";
import { AttendanceStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId")?.trim();
    const startDateParam = searchParams.get("startDate")?.trim();
    const endDateParam = searchParams.get("endDate")?.trim();
    const statusParam = searchParams.get("status")?.trim();

    const whereClause: Record<string, unknown> = {};

    if (employeeId && employeeId !== "ALL") {
      whereClause.employeeId = employeeId;
    }

    if (statusParam && statusParam !== "ALL") {
      whereClause.status = statusParam as AttendanceStatus;
    }

    if (startDateParam || endDateParam) {
      const dateFilter: Record<string, Date> = {};
      if (startDateParam) dateFilter.gte = new Date(startDateParam);
      if (endDateParam) dateFilter.lte = new Date(endDateParam);
      whereClause.date = dateFilter;
    }

    const records = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            department: true,
            profilePictureUrl: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // Today's stats summary for KPI bar
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayRecords = await prisma.attendance.findMany({
      where: { date: todayDate },
    });

    const kpis = {
      presentToday: todayRecords.filter((r) => r.status === "PRESENT").length,
      halfDayToday: todayRecords.filter((r) => r.status === "HALF_DAY").length,
      absentToday: todayRecords.filter((r) => r.status === "ABSENT").length,
      leaveToday: todayRecords.filter((r) => r.status === "LEAVE").length,
    };

    return NextResponse.json({
      success: true,
      data: {
        records,
        kpis,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/attendance error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
