/**
 * Dayflow HRMS — POST /api/attendance/check-in
 * Security & Access Document §2
 *
 * Check-in endpoint for logged-in employee:
 * - Upserts today's Attendance record for (employeeId, date).
 * - Determines status (PRESENT vs HALF_DAY if late check-in > 4 hours).
 * - Enforces single check-in policy.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/rbac/guards";
import { checkInSchema } from "@/lib/validators/attendance";
import { AttendanceStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.user.employeeId) {
      return NextResponse.json({ success: false, error: "Unauthorized or employee profile missing" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const validation = checkInSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const now = new Date();
    // Normalize date to midnight UTC/Local date string for unique (employeeId, date) constraint
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const employeeId = session.user.employeeId;

    // Check if already checked in today
    const existingRecord = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: todayDate,
        },
      },
    });

    if (existingRecord && existingRecord.checkIn) {
      return NextResponse.json(
        {
          success: false,
          error: "Already checked in for today",
          data: existingRecord,
        },
        { status: 400 }
      );
    }

    // Determine status logic: If checked in after 1:00 PM (13:00), mark as HALF_DAY
    const checkInHour = now.getHours();
    const status: AttendanceStatus = checkInHour >= 13 ? AttendanceStatus.HALF_DAY : AttendanceStatus.PRESENT;

    const attendanceRecord = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: todayDate,
        },
      },
      update: {
        checkIn: now,
        status,
      },
      create: {
        employeeId,
        date: todayDate,
        checkIn: now,
        status,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Checked in successfully at ${now.toLocaleTimeString()}`,
      data: attendanceRecord,
    });
  } catch (error) {
    console.error("POST /api/attendance/check-in error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
