/**
 * Dayflow HRMS — Profile Zod Validators
 * Security & Access Document §2 & §5
 *
 * Rules:
 * 1. Employees can only update phone, address, and profilePictureUrl.
 * 2. Admins can update all fields (firstName, lastName, jobTitle, department, dateOfJoining, phone, address, profilePictureUrl).
 */
import { z } from "zod";

export const updateEmployeeSelfSchema = z.object({
  phone: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters")
    .optional()
    .nullable(),
  address: z
    .string()
    .trim()
    .max(200, "Address cannot exceed 200 characters")
    .optional()
    .nullable(),
  profilePictureUrl: z
    .string()
    .trim()
    .url("Invalid image URL")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export const updateEmployeeAdminSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters"),
  jobTitle: z
    .string()
    .trim()
    .min(1, "Job title is required")
    .max(100, "Job title cannot exceed 100 characters"),
  department: z
    .string()
    .trim()
    .min(1, "Department is required")
    .max(100, "Department cannot exceed 100 characters"),
  dateOfJoining: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters")
    .optional()
    .nullable(),
  address: z
    .string()
    .trim()
    .max(200, "Address cannot exceed 200 characters")
    .optional()
    .nullable(),
  profilePictureUrl: z
    .string()
    .trim()
    .url("Invalid image URL")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type UpdateEmployeeSelfInput = z.infer<typeof updateEmployeeSelfSchema>;
export type UpdateEmployeeAdminInput = z.infer<typeof updateEmployeeAdminSchema>;
