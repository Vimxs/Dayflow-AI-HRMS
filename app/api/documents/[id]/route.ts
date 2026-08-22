import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/rbac/guards";
import { prisma } from "@/lib/db/prisma";
import fs from "fs";
import path from "path";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!document) {
      return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
    }

    // Role & ownership check
    const isOwner = document.employee.userId === session.user.userId;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    // Try deleting physical file from disk
    try {
      const diskPath = path.join(process.cwd(), "public", document.fileUrl);
      if (fs.existsSync(diskPath)) {
        fs.unlinkSync(diskPath);
      }
    } catch (fsErr) {
      console.warn("Could not delete physical file:", fsErr);
    }

    // Delete DB record
    await prisma.document.delete({ where: { id } });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.userId,
        action: "DELETE_DOCUMENT",
        entity: "Document",
        entityId: id,
        metadata: JSON.stringify({
          fileName: document.fileName,
          employeeId: document.employeeId,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Document deleted successfully" },
    });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
