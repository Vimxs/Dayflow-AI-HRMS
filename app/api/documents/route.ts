/**
 * Dayflow HRMS — GET & POST /api/documents
 * Security & Access Document §3 & §6
 *
 * Document Management Endpoint:
 * - GET: Fetch documents for logged-in user (or target employeeId if Admin).
 * - POST: Upload document (file validation, size ≤ 5MB, MIME check, DB record, AuditLog).
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthSession } from "@/lib/rbac/guards";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/validators/document";
import { createAuditLog } from "@/lib/audit/logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetEmployeeId = searchParams.get("employeeId");

    let employeeIdToFetch = session.user.employeeId;

    if (targetEmployeeId) {
      if (session.user.role !== "ADMIN" && targetEmployeeId !== session.user.employeeId) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
      employeeIdToFetch = targetEmployeeId;
    }

    if (!employeeIdToFetch) {
      return NextResponse.json({ success: false, error: "Employee profile not found" }, { status: 404 });
    }

    const documents = await prisma.document.findMany({
      where: { employeeId: employeeIdToFetch },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("GET /api/documents error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ success: false, error: "Invalid multipart form data" }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    const docType = (formData.get("docType") as string) || "OTHER";
    const targetEmployeeId = (formData.get("employeeId") as string) || session.user.employeeId;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Role check: Employee can only upload to own profile; Admin can upload to any employee
    if (session.user.role !== "ADMIN" && targetEmployeeId !== session.user.employeeId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (!targetEmployeeId) {
      return NextResponse.json({ success: false, error: "Target employee profile not found" }, { status: 404 });
    }

    // 1. File Size Validation (Max 5MB per Security doc §3)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "File size exceeds the 5MB limit" },
        { status: 400 }
      );
    }

    // 2. MIME Type Validation (PDF, PNG, JPEG only per Security doc §3)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only PDF, PNG, and JPEG/JPG are allowed." },
        { status: 400 }
      );
    }

    // Mock storage URL in dev (Phase 0–3 stub until S3 in T3.4 integration)
    const fileSize = Math.round(file.size / 1024); // KB
    const mockFileUrl = `/uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const newDocument = await prisma.document.create({
      data: {
        employeeId: targetEmployeeId,
        docType: docType.toUpperCase(),
        fileName: file.name,
        fileUrl: mockFileUrl,
        fileSize,
        mimeType: file.type,
      },
    });

    // Audit log document upload (Security doc §6)
    await createAuditLog({
      actorId: session.user.userId,
      action: "UPLOAD_DOCUMENT",
      entity: "Document",
      entityId: newDocument.id,
      metadata: {
        fileName: file.name,
        docType: newDocument.docType,
        fileSize,
        targetEmployeeId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Document uploaded successfully",
        data: newDocument,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/documents error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
