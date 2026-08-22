/**
 * Dayflow HRMS — Email utility stub
 * Architecture doc §3: lib/email/
 *
 * STUB: In development, all emails are printed to console.
 * Wire real Resend/SMTP provider in T7.1.
 * Per Rules §6.5 — stub behind an interface so the rest of the app still runs.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    // STUB: Log email to console in dev — real provider wired in T7.1
    console.warn("[EMAIL STUB] Would send email:", {
      to: payload.to,
      subject: payload.subject,
    });
    return;
  }

  // TODO (T7.1): Implement Resend/SMTP integration
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ from: process.env.EMAIL_FROM, ...payload });
  throw new Error("Email provider not configured. Implement in T7.1.");
}
