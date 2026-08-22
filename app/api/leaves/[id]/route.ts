import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/rbac/guards";
import { prisma } from "@/lib/db/prisma";
import { reviewLeaveSchema, calculateLeaveDays } from "@/lib/validators/leave";
import { AttendanceStatus, LeaveStatus } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            userId: true,
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
    });

    if (!leave) {
      return NextResponse.json(
        { success: false, error: "Leave request not found" },
        { status: 404 }
      );
    }

    // Role check: Employee can only view their own leave request
    if (session.user.role === "EMPLOYEE" && leave.employee.userId !== session.user.userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You do not have permission to view this request" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: leave.id,
        leaveType: leave.leaveType,
        startDate: leave.startDate.toISOString().split("T")[0],
        endDate: leave.endDate.toISOString().split("T")[0],
        days: calculateLeaveDays(leave.startDate, leave.endDate),
        remarks: leave.remarks,
        status: leave.status,
        reviewedBy: leave.reviewedBy
          ? `${leave.reviewedBy.firstName} ${leave.reviewedBy.lastName}`
          : null,
        reviewComment: leave.reviewComment,
        reviewedAt: leave.reviewedAt?.toISOString() || null,
        createdAt: leave.createdAt.toISOString(),
        employee: leave.employee,
      },
    });
  } catch (error) {
    console.error("Leave detail GET API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leave details" },
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
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only HR / Admin can review leave requests" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const validation = reviewLeaveSchema.safeParse(body);

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

    const { status, reviewComment } = validation.data;

    // Fetch existing leave request
    const existingLeave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!existingLeave) {
      return NextResponse.json(
        { success: false, error: "Leave request not found" },
        { status: 404 }
      );
    }

    // Get Admin's employee profile for reviewedById
    const adminEmployee = await prisma.employee.findUnique({
      where: { userId: session.user.userId },
      select: { id: true, firstName: true, lastName: true },
    });

    const reviewedAt = new Date();

    // 1. Update Leave Request
    const updatedLeave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: status as LeaveStatus,
        reviewComment: reviewComment || null,
        reviewedById: adminEmployee?.id || null,
        reviewedAt,
      },
    });

    // 2. If Approved, synchronize Attendance records for date span
    if (status === LeaveStatus.APPROVED) {
      const current = new Date(existingLeave.startDate);
      const end = new Date(existingLeave.endDate);
      current.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      while (current <= end) {
        const dateCopy = new Date(current);
        // Only mark week days (1=Mon to 5=Fri) if needed, or all days in range
        await prisma.attendance.upsert({
          where: {
            employeeId_date: {
              employeeId: existingLeave.employeeId,
              date: dateCopy,
            },
          },
          update: {
            status: AttendanceStatus.LEAVE,
          },
          create: {
            employeeId: existingLeave.employeeId,
            date: dateCopy,
            status: AttendanceStatus.LEAVE,
          },
        });
        current.setDate(current.getDate() + 1);
      }
    }

    // 3. Write AuditLog entry (Security Doc §6)
    await prisma.auditLog.create({
      data: {
        actorId: session.user.userId,
        action: "LEAVE_REVIEW",
        entity: "LeaveRequest",
        entityId: id,
        metadata: JSON.stringify({
          applicantName: `${existingLeave.employee.firstName} ${existingLeave.employee.lastName}`,
          applicantCode: existingLeave.employee.employeeCode,
          previousStatus: existingLeave.status,
          newStatus: status,
          reviewComment: reviewComment || null,
          startDate: existingLeave.startDate.toISOString().split("T")[0],
          endDate: existingLeave.endDate.toISOString().split("T")[0],
          leaveType: existingLeave.leaveType,
        }),
      },
    });

    // 4. Create in-app notification and email for employee applicant (T5.4, T7.1)
    const startStr = existingLeave.startDate.toISOString().split("T")[0];
    const endStr = existingLeave.endDate.toISOString().split("T")[0];
    const commentSnippet = reviewComment ? ` Comment: "${reviewComment}"` : "";

    await prisma.notification.create({
      data: {
        userId: existingLeave.employee.userId,
        type: "LEAVE",
        message: `Your ${existingLeave.leaveType} leave request (${startStr} to ${endStr}) has been ${status}.${commentSnippet}`,
      },
    });

    // Send email in the background
    import("@/lib/email/mailer")
      .then((mailer) =>
        mailer.sendLeaveStatusUpdateEmail(
          existingLeave.employee.user.email,
          `${existingLeave.employee.firstName} ${existingLeave.employee.lastName}`,
          status as "APPROVED" | "REJECTED",
          reviewComment || ""
        )
      )
      .catch((err) => console.error("Failed to send leave status email", err));

    return NextResponse.json({
      success: true,
      data: {
        id: updatedLeave.id,
        status: updatedLeave.status,
        reviewComment: updatedLeave.reviewComment,
        reviewedAt: updatedLeave.reviewedAt?.toISOString(),
      },
      message: `Leave request has been successfully marked as ${status}.`,
    });
  } catch (error) {
    console.error("Leave review PATCH API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process leave review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existingLeave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingLeave) {
      return NextResponse.json(
        { success: false, error: "Leave request not found" },
        { status: 404 }
      );
    }

    // Permission check: Owner can only delete if status is PENDING; Admin can delete any
    if (session.user.role === "EMPLOYEE") {
      if (existingLeave.employee.userId !== session.user.userId) {
        return NextResponse.json(
          { success: false, error: "Forbidden: You cannot cancel another employee's leave" },
          { status: 403 }
        );
      }
      if (existingLeave.status !== LeaveStatus.PENDING) {
        return NextResponse.json(
          {
            success: false,
            error: "Only pending leave requests can be cancelled. Please contact HR for approved leaves.",
          },
          { status: 400 }
        );
      }
    }

    await prisma.leaveRequest.delete({
      where: { id },
    });

    // Write audit log for withdrawal
    await prisma.auditLog.create({
      data: {
        actorId: session.user.userId,
        action: "LEAVE_CANCEL",
        entity: "LeaveRequest",
        entityId: id,
        metadata: JSON.stringify({
          cancelledBy: session.user.role,
          leaveType: existingLeave.leaveType,
          startDate: existingLeave.startDate.toISOString().split("T")[0],
          endDate: existingLeave.endDate.toISOString().split("T")[0],
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Leave request has been successfully cancelled.",
    });
  } catch (error) {
    console.error("Leave DELETE API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel leave request" },
      { status: 500 }
    );
  }
}
