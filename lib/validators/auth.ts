/**
 * Dayflow HRMS — Auth Zod Schemas
 * Security doc §1, §5
 *
 * Rules:
 * 1. Password policy: min 8 chars, 1 upper, 1 lower, 1 number, 1 special char.
 * 2. Public Sign-Up MUST NOT accept a client-submitted `role`. Server forces `EMPLOYEE`.
 * 3. Terms acceptance is mandatory (`terms: z.literal(true)`).
 */
import { z } from "zod";

export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
  .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
  .regex(/[0-9]/, "Password must contain at least 1 number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character");

export const signUpSchema = z.object({
  employeeCode: z
    .string()
    .trim()
    .min(3, "Employee ID must be at least 3 characters")
    .max(20, "Employee ID cannot exceed 20 characters")
    .regex(/^[A-Za-z0-9-]+$/, "Employee ID can only contain letters, numbers, and hyphens"),
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: strongPasswordSchema,
  terms: z.literal(true, {
    message: "You must accept the terms and conditions",
  }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
