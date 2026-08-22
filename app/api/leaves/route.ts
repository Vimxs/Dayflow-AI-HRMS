import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/rbac/guards";
import { prisma } from "@/lib/db/prisma";
import { applyLeaveSchema, calculateLeaveDays } from "@/lib/validators/leave";
import { LeaveStatus, LeaveType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const departmentParam = searchParams.get("department");
    const searchParam = searchParams.get("search")?.toLowerCase().trim();

    // 1. Employee Scope: Return own leaves & live balance calculations
    if (session.user.role === "EMPLOYEE") {
      const employee = await prisma.employee.findUnique({
        where: { userId: session.user.userId },
        include: {
          leaveRequests: {
            orderBy: { createdAt: "desc" },
            include: {
              reviewedBy: {
                select: {
                  firstName: true,
                  lastName: true,
                  jobTitle: true,
                },
              },
            },
          },
        },
      });

      if (!employee) {
        return NextResponse.json(
          { success: false, error: "Employee profile not found" },
          { status: 404 }
        );
      }

      // Filter by status if specified
      let requests = employee.leaveRequests;
      if (statusParam && statusParam !== "ALL" && Object.values(LeaveStatus).includes(statusParam as LeaveStatus)) {
        requests = requests.filter((r) => r.status === statusParam);
      }

      // Calculate annual balances
      const currentYear = new Date().getFullYear();
      let paidUsed = 0;
      let sickUsed = 0;
      let unpaidUsed = 0;
      let pendingCount = 0;

      for (const req of employee.leaveRequests) {
        const start = new Date(req.startDate);
        const days = calculateLeaveDays(req.startDate, req.endDate);

        if (req.status === "PENDING") {
          pendingCount++;
        } else if (req.status === "APPROVED" && start.getFullYear() === currentYear) {
          if (req.leaveType === "PAID") paidUsed += days;
          else if (req.leaveType === "SICK") sickUsed += days;
          else if (req.leaveType === "UNPAID") unpaidUsed += days;
        }
      }

      const paidTotal = 18;
      const sickTotal = 12;
      const balances = {
        paidTotal,
        paidUsed,
        paidRemaining: Math.max(0, paidTotal - paidUsed),
        sickTotal,
        sickUsed,
        sickRemaining: Math.max(0, sickTotal - sickUsed),
        unpaidUsed,
        pendingCount,
      };

      const formattedRequests = requests.map((r) => ({
        id: r.id,
        leaveType: r.leaveType,
        startDate: r.startDate.toISOString().split("T")[0],
        endDate: r.endDate.toISOString().split("T")[0],
        days: calculateLeaveDays(r.startDate, r.endDate),
        remarks: r.remarks,
        status: r.status,
        reviewedBy: r.reviewedBy
          ? `${r.reviewedBy.firstName} ${r.reviewedBy.lastName}`
          : null,
        reviewComment: r.reviewComment,
        reviewedAt: r.reviewedAt?.toISOString() || null,
        createdAt: r.createdAt.toISOString(),
      }));

      return NextResponse.json({
        success: true,
        data: {
          requests: formattedRequests,
          balances,
        },
      });
    }

    // 2. Admin Scope: Return all employee leave requests with filters
    const whereClause: Record<string, unknown> = {};

    if (statusParam && statusParam !== "ALL" && Object.values(LeaveStatus).includes(statusParam as LeaveStatus)) {
      whereClause.status = statusParam as LeaveStatus;
    }

    if (departmentParam && departmentParam !== "ALL") {
      whereClause.employee = {
        department: departmentParam,
      };
    }

    const allRequests = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: true,
            jobTitle: true,
            profilePictureUrl: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        reviewedBy: {
          select: {
            firstName: true,
            lastName: true,
            jobTitle: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Apply search filter if present
    let filtered = allRequests;
    if (searchParam) {
      filtered = allRequests.filter((r) => {
        const fullName = `${r.employee.firstName} ${r.employee.lastName}`.toLowerCase();
        const code = r.employee.employeeCode.toLowerCase();
        const email = r.employee.user.email.toLowerCase();
        const dept = r.employee.department.toLowerCase();
        return (
          fullName.includes(searchParam) ||
          code.includes(searchParam) ||
          email.includes(searchParam) ||
          dept.includes(searchParam)
        );
      });
    }

    // Aggregate KPI stats for Admin
    const totalPending = await prisma.leaveRequest.count({ where: { status: "PENDING" } });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const approvedThisMonth = await prisma.leaveRequest.count({
      where: {
        status: "APPROVED",
        reviewedAt: { gte: startOfMonth },
      },
    });

    const rejectedThisMonth = await prisma.leaveRequest.count({
      where: {
        status: "REJECTED",
        reviewedAt: { gte: startOfMonth },
      },
    });

    const formattedAdminRequests = filtered.map((r) => ({
      id: r.id,
      leaveType: r.leaveType,
      startDate: r.startDate.toISOString().split("T")[0],
      endDate: r.endDate.toISOString().split("T")[0],
      days: calculateLeaveDays(r.startDate, r.endDate),
      remarks: r.remarks,
      status: r.status,
      reviewedBy: r.reviewedBy
        ? `${r.reviewedBy.firstName} ${r.reviewedBy.lastName}`
        : null,
      reviewComment: r.reviewComment,
      reviewedAt: r.reviewedAt?.toISOString() || null,
      createdAt: r.createdAt.toISOString(),
      employee: {
        id: r.employee.id,
        employeeCode: r.employee.employeeCode,
        firstName: r.employee.firstName,
        lastName: r.employee.lastName,
        department: r.employee.department,
        jobTitle: r.employee.jobTitle,
        email: r.employee.user.email,
        profilePictureUrl: r.employee.profilePictureUrl,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        requests: formattedAdminRequests,
        summary: {
          totalPending,
          approvedThisMonth,
          rejectedThisMonth,
        },
      },
    });
  } catch (error) {
    console.error("Leaves GET API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leave requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = applyLeaveSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { leaveType, startDate, endDate, remarks } = validation.data;

    // Get current employee
    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.userId },
      include: {
        leaveRequests: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee profile not found. Please contact HR." },
        { status: 404 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // 1. Check for overlapping pending or approved leave requests
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: employee.id,
        status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
        AND: [
          { startDate: { lte: end } },
          { endDate: { gte: start } },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        {
          success: false,
          error: `You already have an active (${overlapping.status.toLowerCase()}) leave request from ${
            overlapping.startDate.toISOString().split("T")[0]
          } to ${overlapping.endDate.toISOString().split("T")[0]}.`,
        },
        { status: 400 }
      );
    }

    const requestedDays = calculateLeaveDays(startDate, endDate);

    // 2. Create the leave request
    const newLeave = await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        leaveType: leaveType as LeaveType,
        startDate: start,
        endDate: end,
        remarks: remarks || null,
        status: LeaveStatus.PENDING,
      },
    });

    // 3. Dispatch in-app notifications and Emails to all Admins (T5.4, T7.1)
    const adminUsers = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, email: true },
    });

    const applicantName = `${employee.firstName} ${employee.lastName}`;
    if (adminUsers.length > 0) {
      await prisma.notification.createMany({
        data: adminUsers.map((admin) => ({
          userId: admin.id,
          type: "LEAVE",
          message: `New ${leaveType} leave application submitted by ${applicantName} (${requestedDays} ${
            requestedDays === 1 ? "day" : "days"
          }: ${startDate} to ${endDate}).`,
        })),
      });

      // Send emails in the background
      Promise.allSettled(
        adminUsers.map((admin) =>
          import("@/lib/email/mailer").then((mailer) =>
            mailer.sendLeaveRequestEmail(admin.email, applicantName, {
              type: leaveType,
              startDate,
              endDate,
              days: requestedDays,
              remarks: remarks || "None",
            })
          )
        )
      ).catch((err) => console.error("Failed to send leave request emails", err));
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newLeave.id,
          leaveType: newLeave.leaveType,
          startDate: newLeave.startDate.toISOString().split("T")[0],
          endDate: newLeave.endDate.toISOString().split("T")[0],
          days: requestedDays,
          remarks: newLeave.remarks,
          status: newLeave.status,
          createdAt: newLeave.createdAt.toISOString(),
        },
        message: "Leave application submitted successfully for review.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Leaves POST API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit leave application" },
      { status: 500 }
    );
  }
}
