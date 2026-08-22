/**
 * Dayflow HRMS — GET /api/attendance/today
 * Security & Access Document §2
 *
 * Fetches today's check-in/check-out status for logged-in employee.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/rbac/guards";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.user.employeeId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const employeeId = session.user.employeeId;

    const todayRecord = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: todayDate,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: todayRecord || null,
    });
  } catch (error) {
    console.error("GET /api/attendance/today error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
