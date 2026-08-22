/**
 * lib/email/mailer.ts
 * Email sending stub — console-only for Phases 0-6 (hackathon).
 * Wire real SMTP/Resend in T7.1.
 *
 * NOTE: nodemailer is intentionally NOT imported here.
 * The transporter will be added in T7.1 when SMTP_USER/SMTP_PASS are set.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(
  email: string,
  token: string,
  name: string
) {
  const verifyUrl = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;

  // Dev / hackathon stub — console.warn used to satisfy ESLint no-console rule
  console.warn(`\n📧 [EMAIL STUB] Verification email for: ${email}`);
  console.warn(`   Recipient : ${name}`);
  console.warn(`🔗 Verify URL: ${verifyUrl}\n`);

  // TODO T7.1: replace stub with real transport (Resend or Nodemailer SMTP)

  return { success: true, verifyUrl };
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  name: string
) {
  const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;

  // Dev / hackathon stub — console.warn used to satisfy ESLint no-console rule
  console.warn(`\n🔑 [EMAIL STUB] Password reset email for: ${email}`);
  console.warn(`   Recipient : ${name}`);
  console.warn(`🔗 Reset URL : ${resetUrl}\n`);

  // TODO T7.1: wire real transport here

  return { success: true, resetUrl };
}
