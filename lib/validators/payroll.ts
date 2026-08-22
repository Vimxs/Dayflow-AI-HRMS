import { z } from "zod";

export const createPayrollSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  baseSalary: z.number().positive("Base salary must be greater than 0"),
  allowances: z.number().min(0, "Allowances cannot be negative").default(0),
  deductions: z.number().min(0, "Deductions cannot be negative").default(0),
  effectiveFrom: z.string().min(1, "Effective date is required"),
});

export const updatePayrollSchema = z.object({
  baseSalary: z.number().positive("Base salary must be greater than 0").optional(),
  allowances: z.number().min(0, "Allowances cannot be negative").optional(),
  deductions: z.number().min(0, "Deductions cannot be negative").optional(),
  effectiveFrom: z.string().optional(),
});

export type CreatePayrollInput = z.infer<typeof createPayrollSchema>;
export type UpdatePayrollInput = z.infer<typeof updatePayrollSchema>;
