import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dayflow — Human Resource Management System",
  description: "Every workday, perfectly aligned. Modern HRMS for agile teams.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-primary-soft selection:text-primary">
        {children}
      </body>
    </html>
  );
}
