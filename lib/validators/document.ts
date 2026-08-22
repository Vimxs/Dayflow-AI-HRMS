/**
 * Dayflow HRMS — Document Zod Validators
 * Security & Access Document §3
 *
 * Rules:
 * 1. File size max 5MB (5 * 1024 * 1024 bytes).
 * 2. Allowed formats: PDF, PNG, JPEG/JPG.
 */
import { z } from "zod";

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

export const createDocumentMetadataSchema = z.object({
  docType: z
    .string()
    .trim()
    .min(1, "Document type is required")
    .max(50, "Document type cannot exceed 50 characters"),
  fileName: z
    .string()
    .trim()
    .min(1, "File name is required")
    .max(200, "File name cannot exceed 200 characters"),
  fileSizeKb: z.number().positive().optional(),
  mimeType: z
    .string()
    .refine((val) => ALLOWED_MIME_TYPES.includes(val), {
      message: "Unsupported file type. Only PDF, PNG, and JPEG/JPG are allowed.",
    }),
});

export type CreateDocumentMetadataInput = z.infer<typeof createDocumentMetadataSchema>;
