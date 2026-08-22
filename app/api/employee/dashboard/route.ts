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

    // Fetch employee record with relations
    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.userId },
      include: {
        attendances: {
          orderBy: { date: "desc" },
          take: 7,
        },
        leaveRequests: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        payroll: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee profile not found" },
        { status: 404 }
      );
    }

    // Today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        date: { gte: today },
      },
    });

    // Calculate streak (consecutive present days)
    const recentAttendances = await prisma.attendance.findMany({
      where: { employeeId: employee.id },
      orderBy: { date: "desc" },
      take: 30,
    });

    let streak = 0;
    for (const record of recentAttendances) {
      if (record.status === "PRESENT") {
        streak++;
      } else {
        break;
      }
    }

    // Leave counts and balances
    const pendingLeaves = employee.leaveRequests.filter(
      (l) => l.status === "PENDING"
    ).length;

    // Calculate days for approved leaves
    const approvedLeaves = await prisma.leaveRequest.findMany({
      where: {
        employeeId: employee.id,
        status: "APPROVED",
      },
    });

    let approvedPaidDays = 0;
    let approvedSickDays = 0;

    for (const leave of approvedLeaves) {
      const diffTime = Math.abs(new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime());
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (leave.leaveType === "PAID") {
        approvedPaidDays += days;
      } else if (leave.leaveType === "SICK") {
        approvedSickDays += days;
      }
    }

    // Standard annual allocation (e.g. 18 Paid, 12 Sick)
    const leaveBalances = {
      paid: Math.max(0, 18 - approvedPaidDays),
      sick: Math.max(0, 12 - approvedSickDays),
      pendingRequests: pendingLeaves,
    };

    // Construct activity feed
    const activities = [
      ...employee.attendances.map((a) => ({
        id: a.id,
        type: "ATTENDANCE",
        title: `Attendance logged: ${a.status.replace("_", " ")}`,
        timestamp: a.checkIn ? a.checkIn.toISOString() : a.date.toISOString(),
        status: a.status,
      })),
      ...employee.leaveRequests.map((l) => ({
        id: l.id,
        type: "LEAVE",
        title: `Leave request: ${l.leaveType} (${l.status})`,
        timestamp: l.createdAt.toISOString(),
        status: l.status,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 5);

    // Format payroll if present
    const latestPayroll = employee.payroll
      ? {
          id: employee.payroll.id,
          effectiveFrom: employee.payroll.effectiveFrom.toISOString(),
          baseSalary: employee.payroll.baseSalary,
          allowances: employee.payroll.allowances,
          deductions: employee.payroll.deductions,
          netSalary:
            employee.payroll.baseSalary +
            employee.payroll.allowances -
            employee.payroll.deductions,
        }
      : null;

    return NextResponse.json({
      success: true,
      data: {
        employee: {
          id: employee.id,
          employeeCode: employee.employeeCode,
          firstName: employee.firstName,
          lastName: employee.lastName,
          jobTitle: employee.jobTitle,
          department: employee.department,
          phone: employee.phone,
          address: employee.address,
        },
        todayAttendance: todayAttendance
          ? {
              id: todayAttendance.id,
              status: todayAttendance.status,
              checkIn: todayAttendance.checkIn ? todayAttendance.checkIn.toISOString() : null,
              checkOut: todayAttendance.checkOut ? todayAttendance.checkOut.toISOString() : null,
            }
          : null,
        streak,
        weeklyAttendance: employee.attendances.reverse().map((a) => ({
          id: a.id,
          date: a.date.toISOString(),
          status: a.status,
          checkIn: a.checkIn ? a.checkIn.toISOString() : null,
          checkOut: a.checkOut ? a.checkOut.toISOString() : null,
        })),
        leaveBalances,
        recentLeaves: employee.leaveRequests.map((l) => ({
          id: l.id,
          leaveType: l.leaveType,
          startDate: l.startDate.toISOString(),
          endDate: l.endDate.toISOString(),
          status: l.status,
          remarks: l.remarks,
        })),
        latestPayroll,
        activities,
      },
    });
  } catch (error) {
    console.error("Employee dashboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
