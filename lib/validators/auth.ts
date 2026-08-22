<<<<<<< HEAD
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
=======
import { z } from "zod";

// Password policy: min 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");
>>>>>>> e4fb065fc1b45a9d7b6af152787dedc2e41f4873

export const signUpSchema = z.object({
  employeeCode: z
    .string()
<<<<<<< HEAD
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
=======
    .min(3, "Employee ID must be at least 3 characters")
    .max(20, "Employee ID must not exceed 20 characters")
    .regex(/^[A-Z0-9-]+$/i, "Employee ID must contain only alphanumeric characters or hyphens"),
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters"),
  email: z
    .string()
    .email("Please provide a valid corporate email address")
    .toLowerCase()
    .trim(),
  password: passwordSchema,
  role: z.enum(["EMPLOYEE", "ADMIN"]).default("EMPLOYEE"),
  department: z.string().min(2, "Department is required"),
  jobTitle: z.string().min(2, "Job title is required"),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: passwordSchema,
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
>>>>>>> e4fb065fc1b45a9d7b6af152787dedc2e41f4873
