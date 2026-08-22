/**
 * lib/email/mailer.ts
 * Configured with Nodemailer for email delivery.
 * Falls back to console logging if SMTP_USER is not set.
 */

import nodemailer from "nodemailer";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const isEmailConfigured = !!process.env.SMTP_USER && !!process.env.SMTP_PASS;

function getTransporter() {
  if (!isEmailConfigured) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendMailStubOrReal(options: nodemailer.SendMailOptions) {
  if (isEmailConfigured) {
    try {
      const transporter = getTransporter();
      if (!transporter) return false;
      const from = process.env.SMTP_FROM || `"Dayflow HRMS" <${process.env.SMTP_USER}>`;
      await transporter.sendMail({ from, ...options });
      return true;
    } catch (error) {
      console.error("[MAILER ERROR] Failed to send email:", error);
      return false;
    }
  } else {
    console.warn("\n📧 [EMAIL STUB - SMTP not configured]");
    console.warn(`   To      : ${options.to}`);
    console.warn(`   Subject : ${options.subject}`);
    console.warn(`   Text    : ${String(options.text || "").substring(0, 100)}...`);
    console.warn("----------------------------------------\n");
    return true;
  }
}

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
  await sendMailStubOrReal({
    to: email,
    subject: "Verify your email - Dayflow HRMS",
    text: `Hello ${name},\n\nPlease verify your email by clicking the following link: ${verifyUrl}`,
    html: `<p>Hello ${name},</p><p>Please verify your email by clicking the following link:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });
  return { success: true, verifyUrl };
}

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
  await sendMailStubOrReal({
    to: email,
    subject: "Reset your password - Dayflow HRMS",
    text: `Hello ${name},\n\nPlease reset your password by clicking the following link: ${resetUrl}`,
    html: `<p>Hello ${name},</p><p>Please reset your password by clicking the following link:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
  return { success: true, resetUrl };
}

export async function sendLeaveRequestEmail(
  adminEmail: string,
  employeeName: string,
  leaveDetails: { type: string; startDate: string; endDate: string; days: number; remarks: string }
) {
  const approvalsUrl = `${APP_URL}/admin/leaves`;
  await sendMailStubOrReal({
    to: adminEmail,
    subject: "New Leave Request Submitted - Dayflow HRMS",
    text: `${employeeName} has submitted a new ${leaveDetails.type} leave request for ${leaveDetails.days} days (${leaveDetails.startDate} to ${leaveDetails.endDate}).\n\nRemarks: ${leaveDetails.remarks}\n\nReview at: ${approvalsUrl}`,
    html: `<p><strong>${employeeName}</strong> has submitted a new <strong>${leaveDetails.type}</strong> leave request for <strong>${leaveDetails.days}</strong> days (${leaveDetails.startDate} to ${leaveDetails.endDate}).</p><p>Remarks: ${leaveDetails.remarks}</p><p><a href="${approvalsUrl}">Review Request</a></p>`,
  });
  return { success: true };
}

export async function sendLeaveStatusUpdateEmail(
  employeeEmail: string,
  employeeName: string,
  status: "APPROVED" | "REJECTED",
  adminComment: string
) {
  const portalUrl = `${APP_URL}/employee/leaves`;
  await sendMailStubOrReal({
    to: employeeEmail,
    subject: `Leave Request ${status} - Dayflow HRMS`,
    text: `Hello ${employeeName},\n\nYour leave request has been ${status}.\n\nSupervisor Comment: ${adminComment || "None"}\n\nView details at: ${portalUrl}`,
    html: `<p>Hello ${employeeName},</p><p>Your leave request has been <strong>${status}</strong>.</p><p>Supervisor Comment: ${adminComment || "None"}</p><p><a href="${portalUrl}">View Details</a></p>`,
  });
  return { success: true };
}
