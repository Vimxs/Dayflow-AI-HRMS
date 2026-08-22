/**
 * Dayflow HRMS — POST /api/attendance/check-out
 * Security & Access Document §2
 *
 * Check-out endpoint for logged-in employee:
 * - Updates checkOut timestamp for today's active attendance record.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/rbac/guards";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.user.employeeId) {
      return NextResponse.json({ success: false, error: "Unauthorized or employee profile missing" }, { status: 401 });
    }

    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const employeeId = session.user.employeeId;

    const existingRecord = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: todayDate,
        },
      },
    });

    if (!existingRecord || !existingRecord.checkIn) {
      return NextResponse.json(
        { success: false, error: "You must check in before checking out" },
        { status: 400 }
      );
    }

    if (existingRecord.checkOut) {
      return NextResponse.json(
        { success: false, error: "Already checked out for today", data: existingRecord },
        { status: 400 }
      );
    }

    const updatedRecord = await prisma.attendance.update({
      where: { id: existingRecord.id },
      data: {
        checkOut: now,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Checked out successfully at ${now.toLocaleTimeString()}`,
      data: updatedRecord,
    });
  } catch (error) {
    console.error("POST /api/attendance/check-out error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
