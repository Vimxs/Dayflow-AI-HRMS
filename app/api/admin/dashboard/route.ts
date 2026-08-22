import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/rbac/guards";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    // 1. KPI Metrics
    const totalEmployees = await prisma.employee.count();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const presentToday = await prisma.attendance.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        status: { in: ["PRESENT", "HALF_DAY"] },
      },
    });

    const onLeaveToday = await prisma.attendance.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        status: "LEAVE",
      },
    });

    const pendingApprovals = await prisma.leaveRequest.count({
      where: { status: "PENDING" },
    });

    // 2. Weekly Attendance Chart Data (Past 7 Days)
    const chartDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const dayAttendances = await prisma.attendance.findMany({
        where: {
          date: {
            gte: d,
            lt: nextD,
          },
        },
      });

      const presentCount = dayAttendances.filter((a) => a.status === "PRESENT").length;
      const halfDayCount = dayAttendances.filter((a) => a.status === "HALF_DAY").length;
      const leaveCount = dayAttendances.filter((a) => a.status === "LEAVE").length;
      const absentCount = dayAttendances.filter((a) => a.status === "ABSENT").length;

      chartDays.push({
        name: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: d.toISOString().split("T")[0],
        Present: presentCount,
        HalfDay: halfDayCount,
        Leave: leaveCount,
        Absent: absentCount,
      });
    }

    // 3. Top Pending Leave Requests Queue
    const rawPendingLeaves = await prisma.leaveRequest.findMany({
      where: { status: "PENDING" },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: true,
            jobTitle: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const pendingLeaveQueue = rawPendingLeaves.map((l) => {
      const diffTime = Math.abs(new Date(l.endDate).getTime() - new Date(l.startDate).getTime());
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return {
        id: l.id,
        leaveType: l.leaveType,
        startDate: l.startDate.toISOString(),
        endDate: l.endDate.toISOString(),
        days,
        remarks: l.remarks,
        createdAt: l.createdAt.toISOString(),
        employee: l.employee,
      };
    });

    // 4. Employee Directory Preview (Recent / Searchable)
    const recentEmployees = await prisma.employee.findMany({
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        department: true,
        jobTitle: true,
        dateOfJoining: true,
        user: {
          select: {
            email: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // 5. Leave Type Distribution (T7.3)
    const thisYear = new Date(new Date().getFullYear(), 0, 1);
    const leaveStats = await prisma.leaveRequest.groupBy({
      by: ["leaveType"],
      where: {
        status: "APPROVED",
        startDate: { gte: thisYear },
      },
      _count: {
        _all: true,
      },
    });

    const leaveDistribution = leaveStats.map(stat => ({
      name: stat.leaveType === "PAID" ? "Paid Leave" : stat.leaveType === "SICK" ? "Sick Leave" : "Unpaid Leave",
      value: stat._count._all,
      color: stat.leaveType === "PAID" ? "#12B8A6" : stat.leaveType === "SICK" ? "#F5A623" : "#5B4FE9",
    }));

    // If no leaves approved yet this year, provide default zero values
    if (leaveDistribution.length === 0) {
      leaveDistribution.push(
        { name: "Paid Leave", value: 0, color: "#12B8A6" },
        { name: "Sick Leave", value: 0, color: "#F5A623" },
        { name: "Unpaid Leave", value: 0, color: "#5B4FE9" }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalEmployees,
          presentToday,
          pendingApprovals,
          onLeaveToday,
        },
        attendanceTrend: chartDays,
        leaveDistribution,
        pendingApprovalsList: pendingLeaveQueue,
        employees: recentEmployees,
      },
    });
  } catch (error) {
    console.error("Admin dashboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin dashboard metrics" },
      { status: 500 }
    );
  }
}
