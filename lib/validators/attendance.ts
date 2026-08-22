/**
 * Dayflow HRMS — Attendance Zod Validators
 * Security & Access Document §2 & §5
 *
 * Rules:
 * 1. Check-in optional remarks/location up to 200 chars.
 * 2. Query filters validate date ranges and status choices.
 */
import { z } from "zod";

export const checkInSchema = z.object({
  remarks: z.string().trim().max(200, "Remarks cannot exceed 200 characters").optional().nullable(),
  location: z.string().trim().max(100, "Location cannot exceed 100 characters").optional().nullable(),
});

export const checkOutSchema = z.object({
  remarks: z.string().trim().max(200, "Remarks cannot exceed 200 characters").optional().nullable(),
});

export const attendanceQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  employeeId: z.string().optional(),
  status: z.enum(["ALL", "PRESENT", "ABSENT", "HALF_DAY", "LEAVE"]).optional().default("ALL"),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type AttendanceQueryInput = z.infer<typeof attendanceQuerySchema>;
