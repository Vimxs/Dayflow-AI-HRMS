/**
 * Dayflow HRMS — Prisma Seed
 * Seeds one Admin and one Employee for local development.
 * Run: npm run db:seed
 *
 * NEVER use real credentials here. These are dev-only dummy accounts.
 */
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.warn("🌱 Seeding Dayflow HRMS database...");

  // ASSUMPTION: bcrypt cost 12 per Security doc §1
  const BCRYPT_COST = 12;

  // ── 1. Admin / HR Officer ────────────────────────────────
  const adminPasswordHash = await bcrypt.hash("Admin@1234", BCRYPT_COST);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@dayflow.dev" },
    update: {},
    create: {
      email: "admin@dayflow.dev",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isVerified: true, // Pre-verified for dev convenience
    },
  });

  await prisma.employee.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      employeeCode: "EMP-0001",
      firstName: "Anita",
      lastName: "Sharma",
      jobTitle: "HR Officer",
      department: "Human Resources",
      dateOfJoining: new Date("2023-01-01"),
    },
  });

  console.warn("✅ Admin user seeded: admin@dayflow.dev / Admin@1234");

  // ── 2. Employee ──────────────────────────────────────────
  const employeePasswordHash = await bcrypt.hash("Employee@1234", BCRYPT_COST);

  const employeeUser = await prisma.user.upsert({
    where: { email: "rahul@dayflow.dev" },
    update: {},
    create: {
      email: "rahul@dayflow.dev",
      passwordHash: employeePasswordHash,
      role: Role.EMPLOYEE,
      isVerified: true, // Pre-verified for dev convenience
    },
  });

  const employeeProfile = await prisma.employee.upsert({
    where: { userId: employeeUser.id },
    update: {},
    create: {
      userId: employeeUser.id,
      employeeCode: "EMP-0002",
      firstName: "Rahul",
      lastName: "Mehta",
      jobTitle: "Software Engineer",
      department: "Engineering",
      dateOfJoining: new Date("2024-03-15"),
    },
  });

  // Seed a payroll record for the employee
  const existingPayroll = await prisma.payroll.findFirst({
    where: { employeeId: employeeProfile.id },
  });

  if (!existingPayroll) {
    await prisma.payroll.create({
      data: {
        employeeId: employeeProfile.id,
        baseSalary: 50000,
        allowances: 5000,
        deductions: 2000,
        effectiveFrom: new Date("2024-04-01"),
      },
    });
  }

  console.warn("✅ Employee user seeded: rahul@dayflow.dev / Employee@1234");
  console.warn("🎉 Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
