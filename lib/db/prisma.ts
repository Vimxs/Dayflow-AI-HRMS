/**
 * Dayflow HRMS — Prisma Client singleton
 * Architecture doc §3: lib/db/
 *
 * Uses global singleton pattern to avoid creating multiple Prisma instances
 * in development (Next.js hot reloads would otherwise exhaust DB connections).
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
