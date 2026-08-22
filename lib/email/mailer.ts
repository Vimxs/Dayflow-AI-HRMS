import nodemailer from "nodemailer";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || "Dayflow HRMS <no-reply@dayflow.internal>";

const isDev = process.env.NODE_ENV !== "production";

// Configure transport
const transporter = nodemailer.createTransport({
  host: SMTP_HOST || "localhost",
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth:
    SMTP_USER && SMTP_PASS && SMTP_USER !== "dev_user" && SMTP_USER !== "placeholder_smtp_user"
      ? {
          user: SMTP_USER,
          pass: SMTP_PASS,
        }
      : undefined,
});

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;

  const subject = "Verify your Dayflow HRMS Account";
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #FBFAFF; border-radius: 12px; border: 1px solid #E7E5F5;">
      <div style="background: #5B4FE9; padding: 16px; border-radius: 8px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 22px;">Dayflow HRMS</h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Every workday, perfectly aligned.</p>
      </div>
      <div style="padding: 24px 8px; color: #1A1B25;">
        <h2 style="font-size: 18px; margin-top: 0;">Welcome to Dayflow, ${name}!</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #4B5162;">
          Your HRMS account has been registered. Please click the button below to verify your corporate email address and activate your account.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${verifyUrl}" style="background: #5B4FE9; color: white; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="font-size: 12px; color: #6B7280; line-height: 1.5;">
          Or copy and paste this verification link into your browser:<br/>
          <a href="${verifyUrl}" style="color: #5B4FE9; word-break: break-all;">${verifyUrl}</a>
        </p>
        <p style="font-size: 12px; color: #9CA3AF; margin-top: 24px;">
          This verification link will expire in 24 hours. If you did not request this registration, please contact your HR administrator.
        </p>
      </div>
    </div>
  `;

  console.log(`\n📧 [EMAIL STUB] Verification email for: ${email}`);
  console.log(`🔗 Verification URL: ${verifyUrl}\n`);

  if (!isDev && SMTP_USER && SMTP_USER !== "placeholder_smtp_user") {
    try {
      await transporter.sendMail({
        from: SMTP_FROM,
        to: email,
        subject,
        html,
      });
    } catch (err) {
      console.error("Failed to send verification email via SMTP:", err);
    }
  }

  return { success: true, verifyUrl };
}

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;

  const subject = "Reset Your Dayflow Password";
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #FBFAFF; border-radius: 12px; border: 1px solid #E7E5F5;">
      <div style="background: #5B4FE9; padding: 16px; border-radius: 8px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 22px;">Dayflow HRMS</h1>
      </div>
      <div style="padding: 24px 8px; color: #1A1B25;">
        <h2 style="font-size: 18px; margin-top: 0;">Password Reset Request</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #4B5162;">
          Hello ${name}, we received a request to reset the password for your Dayflow HRMS account. Click the button below to set a new password.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background: #5B4FE9; color: white; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 12px; color: #6B7280; line-height: 1.5;">
          Or copy and paste this reset link into your browser:<br/>
          <a href="${resetUrl}" style="color: #5B4FE9; word-break: break-all;">${resetUrl}</a>
        </p>
        <p style="font-size: 12px; color: #E5484D; font-weight: 500;">
          This link is single-use and will expire in 15 minutes.
        </p>
      </div>
    </div>
  `;

  console.log(`\n🔑 [EMAIL STUB] Password reset email for: ${email}`);
  console.log(`🔗 Reset URL: ${resetUrl}\n`);

  if (!isDev && SMTP_USER && SMTP_USER !== "placeholder_smtp_user") {
    try {
      await transporter.sendMail({
        from: SMTP_FROM,
        to: email,
        subject,
        html,
      });
    } catch (err) {
      console.error("Failed to send reset email via SMTP:", err);
    }
  }

  return { success: true, resetUrl };
}
