import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/rbac/guards";
import { prisma } from "@/lib/db/prisma";
import { generateSalarySlipPDF } from "@/lib/pdf/salary-slip";

type RouteParams = { params: Promise<{ employeeId: string }> };

// GET /api/payroll/[employeeId]/slip?month=YYYY-MM
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { employeeId } = await params;
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

    // Validate YYYY-MM format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { success: false, error: "Invalid month format. Use YYYY-MM" },
        { status: 400 }
      );
    }

    // Ownership check for employees
    if (session.user.role !== "ADMIN" && session.user.employeeId !== employeeId) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You can only download your own salary slip" },
        { status: 403 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: { select: { email: true } },
        payroll: true,
      },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    if (!employee.payroll) {
      return NextResponse.json(
        { success: false, error: "No payroll record found for this employee" },
        { status: 404 }
      );
    }

    const pdfBuffer = await generateSalarySlipPDF({
      employee: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeCode: employee.employeeCode,
        department: employee.department,
        jobTitle: employee.jobTitle,
        email: employee.user.email,
        dateOfJoining: employee.dateOfJoining.toISOString(),
      },
      payroll: {
        baseSalary: employee.payroll.baseSalary,
        allowances: employee.payroll.allowances,
        deductions: employee.payroll.deductions,
        effectiveFrom: employee.payroll.effectiveFrom.toISOString(),
      },
      month,
    });

    const fileName = `salary-slip-${employee.employeeCode}-${month}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("Salary slip PDF error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate salary slip" },
      { status: 500 }
    );
  }
}
