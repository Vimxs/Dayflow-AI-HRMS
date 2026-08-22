/**
 * Dayflow HRMS — Zod validators (stubs)
 * Architecture doc §3: lib/validators/
 * Rules §3: "All API inputs validated with zod schemas — no exceptions"
 *
 * Full schemas built per-ticket in Phases 1–6.
 */
import { z } from "zod";

// ── Common Schemas ─────────────────────────────────────────

export const emailSchema = z.string().email("Invalid email address");

// Password policy per Security doc §1
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least 1 uppercase letter")
  .regex(/[a-z]/, "Must contain at least 1 lowercase letter")
  .regex(/[0-9]/, "Must contain at least 1 number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least 1 special character");

// Pagination params used on all list endpoints
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ── API Response Envelope ──────────────────────────────────
// Architecture doc §5: "Consistent response envelope: { success, data, error }"
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function errorResponse(message: string): ApiResponse {
  return { success: false, error: message };
}
