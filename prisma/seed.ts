/* eslint-disable no-console */
import { PrismaClient, Role, AttendanceStatus, LeaveType, LeaveStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  // Password hashes
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const employeePasswordHash = await bcrypt.hash("Rahul@123", 10);
  const priyaPasswordHash = await bcrypt.hash("Priya@123", 10);

  // 1. Create Admin User (Anita Roy - HR Officer)
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@dayflow.com",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isVerified: true,
      employee: {
        create: {
          employeeCode: "EMP001",
          firstName: "Anita",
          lastName: "Roy",
          phone: "+91 98765 43210",
          address: "14B Palm Grove, Cyber City, Bangalore, KA 560103",
          jobTitle: "HR Lead & Operations",
          department: "Human Resources",
          dateOfJoining: new Date("2022-03-15"),
          profilePictureUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
          payroll: {
            create: {
              baseSalary: 120000,
              allowances: 25000,
              deductions: 12000,
              effectiveFrom: new Date("2024-01-01"),
            },
          },
        },
      },
    },
    include: { employee: true },
  });

  // 2. Create Employee User (Rahul Sharma)
  const rahulUser = await prisma.user.create({
    data: {
      email: "rahul@dayflow.com",
      passwordHash: employeePasswordHash,
      role: Role.EMPLOYEE,
      isVerified: true,
      employee: {
        create: {
          employeeCode: "EMP002",
          firstName: "Rahul",
          lastName: "Sharma",
          phone: "+91 91234 56789",
          address: "702 Sunshine Residency, Indiranagar, Bangalore, KA 560038",
          jobTitle: "Senior Software Engineer",
          department: "Engineering",
          dateOfJoining: new Date("2023-06-01"),
          profilePictureUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          payroll: {
            create: {
              baseSalary: 95000,
              allowances: 18000,
              deductions: 9500,
              effectiveFrom: new Date("2024-01-01"),
            },
          },
        },
      },
    },
    include: { employee: true },
  });

  // 3. Create Employee User (Priya Patel)
  const priyaUser = await prisma.user.create({
    data: {
      email: "priya@dayflow.com",
      passwordHash: priyaPasswordHash,
      role: Role.EMPLOYEE,
      isVerified: true,
      employee: {
        create: {
          employeeCode: "EMP003",
          firstName: "Priya",
          lastName: "Patel",
          phone: "+91 98877 66554",
          address: "23 Lakeview Heights, Koramangala, Bangalore, KA 560034",
          jobTitle: "Product Designer",
          department: "Design",
          dateOfJoining: new Date("2023-09-15"),
          profilePictureUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
          payroll: {
            create: {
              baseSalary: 85000,
              allowances: 15000,
              deductions: 8000,
              effectiveFrom: new Date("2024-01-01"),
            },
          },
        },
      },
    },
    include: { employee: true },
  });

  if (!adminUser.employee || !rahulUser.employee || !priyaUser.employee) {
    throw new Error("Failed to create employee records");
  }

  // 4. Seed Attendance Records for the current week
  const _today = new Date();
  const getPastDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Rahul attendance (Present past few days, checked in today)
  await prisma.attendance.createMany({
    data: [
      {
        employeeId: rahulUser.employee.id,
        date: getPastDate(3),
        checkIn: new Date(getPastDate(3).setHours(9, 15)),
        checkOut: new Date(getPastDate(3).setHours(18, 5)),
        status: AttendanceStatus.PRESENT,
      },
      {
        employeeId: rahulUser.employee.id,
        date: getPastDate(2),
        checkIn: new Date(getPastDate(2).setHours(9, 2)),
        checkOut: new Date(getPastDate(2).setHours(18, 30)),
        status: AttendanceStatus.PRESENT,
      },
      {
        employeeId: rahulUser.employee.id,
        date: getPastDate(1),
        checkIn: new Date(getPastDate(1).setHours(9, 30)),
        checkOut: new Date(getPastDate(1).setHours(14, 0)),
        status: AttendanceStatus.HALF_DAY,
      },
      {
        employeeId: rahulUser.employee.id,
        date: getPastDate(0),
        checkIn: new Date(getPastDate(0).setHours(9, 5)),
        status: AttendanceStatus.PRESENT,
      },
    ],
  });

  // Priya attendance
  await prisma.attendance.createMany({
    data: [
      {
        employeeId: priyaUser.employee.id,
        date: getPastDate(2),
        checkIn: new Date(getPastDate(2).setHours(9, 10)),
        checkOut: new Date(getPastDate(2).setHours(17, 50)),
        status: AttendanceStatus.PRESENT,
      },
      {
        employeeId: priyaUser.employee.id,
        date: getPastDate(1),
        status: AttendanceStatus.LEAVE,
      },
      {
        employeeId: priyaUser.employee.id,
        date: getPastDate(0),
        checkIn: new Date(getPastDate(0).setHours(9, 20)),
        status: AttendanceStatus.PRESENT,
      },
    ],
  });

  // Admin attendance
  await prisma.attendance.create({
    data: {
      employeeId: adminUser.employee.id,
      date: getPastDate(0),
      checkIn: new Date(getPastDate(0).setHours(8, 55)),
      status: AttendanceStatus.PRESENT,
    },
  });

  // 5. Seed Leave Requests
  await prisma.leaveRequest.create({
    data: {
      employeeId: rahulUser.employee.id,
      leaveType: LeaveType.PAID,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-09-03"),
      remarks: "Annual family vacation",
      status: LeaveStatus.PENDING,
    },
  });

  await prisma.leaveRequest.create({
    data: {
      employeeId: priyaUser.employee.id,
      leaveType: LeaveType.SICK,
      startDate: getPastDate(1),
      endDate: getPastDate(1),
      remarks: "Viral fever and recovery",
      status: LeaveStatus.APPROVED,
      reviewedById: adminUser.employee.id,
      reviewComment: "Approved. Take care and get well soon!",
      reviewedAt: new Date(),
    },
  });

  // 6. Seed Notifications
  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      message: "Rahul Sharma has submitted a Paid Leave request for Sep 1 - Sep 3.",
      type: "APPROVAL_PENDING",
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: priyaUser.id,
      message: "Your Sick Leave request for yesterday has been approved by Anita Roy.",
      type: "LEAVE_STATUS",
      isRead: true,
    },
  });

  // 7. Seed Initial Audit Log
  await prisma.auditLog.create({
    data: {
      actorId: adminUser.id,
      action: "LEAVE_APPROVAL",
      entity: "LeaveRequest",
      entityId: "initial-seed-leave-id",
      metadata: JSON.stringify({
        status: "APPROVED",
        reviewedBy: "Anita Roy",
        employee: "Priya Patel",
      }),
    },
  });

  console.log("Seeding finished successfully.");
  console.log("Accounts created:");
  console.log("  Admin:    admin@dayflow.com  / Admin@123");
  console.log("  Employee: rahul@dayflow.com  / Rahul@123");
  console.log("  Employee: priya@dayflow.com  / Priya@123");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
