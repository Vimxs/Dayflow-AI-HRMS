import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/rbac/guards";
import { prisma } from "@/lib/db/prisma";
import fs from "fs";
import path from "path";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const docType = (formData.get("docType") as string) || "GENERAL";
    const targetEmployeeId = formData.get("employeeId") as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds the 5MB limit" },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Allowed formats: PDF, PNG, JPEG, WEBP",
        },
        { status: 400 }
      );
    }

    // Identify target employee
    let employeeId = "";
    if (session.user.role === "ADMIN" && targetEmployeeId) {
      employeeId = targetEmployeeId;
    } else {
      const selfEmployee = await prisma.employee.findUnique({
        where: { userId: session.user.userId },
      });
      if (!selfEmployee) {
        return NextResponse.json(
          { success: false, error: "Employee profile not found" },
          { status: 404 }
        );
      }
      employeeId = selfEmployee.id;
    }

    // Save file locally in public/uploads/documents (dev storage stub per T3.4)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "documents");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadsDir, safeFileName);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/documents/${safeFileName}`;

    // Create Document record in DB
    const document = await prisma.document.create({
      data: {
        employeeId,
        fileName: file.name,
        fileUrl,
        docType,
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.userId,
        action: "UPLOAD_DOCUMENT",
        entity: "Document",
        entityId: document.id,
        metadata: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          employeeId,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Document uploaded successfully",
        document: {
          id: document.id,
          fileName: document.fileName,
          fileUrl: document.fileUrl,
          docType: document.docType,
          fileSize: document.fileSize,
          mimeType: document.mimeType,
          uploadedAt: document.uploadedAt.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
