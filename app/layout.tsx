import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Dayflow HRMS",
    template: "%s | Dayflow HRMS",
  },
  description:
    "Dayflow — Human Resource Management System. Streamline onboarding, attendance, leave management, and payroll in one secure, modern dashboard.",
  keywords: ["HRMS", "HR", "Human Resources", "Attendance", "Leave Management", "Payroll"],
  authors: [{ name: "Dayflow" }],
  robots: { index: false, follow: false }, // Private app — do not index
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts — Sora (headings) + Inter (body) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
