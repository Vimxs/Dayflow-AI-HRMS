/**
 * Dayflow HRMS — DELETE /api/documents/[id]
 * Security & Access Document §3 & §6
 *
 * Delete Document Endpoint:
 * - Restricted to document owner or Admin.
 * - Records DELETE_DOCUMENT in AuditLog.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthSession } from "@/lib/rbac/guards";
import { createAuditLog } from "@/lib/audit/logger";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const document = await prisma.document.findUnique({ where: { id } });

    if (!document) {
      return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
    }

    // Role check: Only document owner or Admin can delete
    if (session.user.role !== "ADMIN" && document.employeeId !== session.user.employeeId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await prisma.document.delete({ where: { id } });

    // Audit log document deletion (Security doc §6)
    await createAuditLog({
      actorId: session.user.userId,
      action: "DELETE_DOCUMENT",
      entity: "Document",
      entityId: id,
      metadata: {
        fileName: document.fileName,
        docType: document.docType,
        employeeId: document.employeeId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/documents/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
