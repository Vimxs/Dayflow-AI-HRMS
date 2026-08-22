import { z } from "zod";
import { LeaveType, LeaveStatus } from "@prisma/client";

export const applyLeaveSchema = z
  .object({
    leaveType: z.nativeEnum(LeaveType, {
      errorMap: () => ({ message: "Please select a valid leave type (PAID, SICK, UNPAID)" }),
    }),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
    remarks: z.string().max(500, "Remarks cannot exceed 500 characters").optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end;
    },
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  );

export type ApplyLeaveInput = z.infer<typeof applyLeaveSchema>;

export const reviewLeaveSchema = z.object({
  status: z.enum([LeaveStatus.APPROVED, LeaveStatus.REJECTED], {
    errorMap: () => ({ message: "Status must be either APPROVED or REJECTED" }),
  }),
  reviewComment: z.string().max(500, "Review comment cannot exceed 500 characters").optional().or(z.literal("")),
});

export type ReviewLeaveInput = z.infer<typeof reviewLeaveSchema>;

export function calculateLeaveDays(startDate: string | Date, endDate: string | Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}
