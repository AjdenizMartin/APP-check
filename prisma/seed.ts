import { PrismaClient, UserRole, VisitStatus, VisitResultType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = process.env.SEED_DEFAULT_PASSWORD ?? "Change123!";
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@appplus.local" },
    update: { name: "Admin User", role: UserRole.ADMIN, passwordHash, isActive: true },
    create: { email: "admin@appplus.local", name: "Admin User", role: UserRole.ADMIN, passwordHash, isActive: true },
  });

  const supervisor = await prisma.user.upsert({
    where: { email: "supervisor@appplus.local" },
    update: { name: "Supervisor User", role: UserRole.SUPERVISOR, passwordHash, isActive: true },
    create: { email: "supervisor@appplus.local", name: "Supervisor User", role: UserRole.SUPERVISOR, passwordHash, isActive: true },
  });

  const employee = await prisma.user.upsert({
    where: { email: "employee@appplus.local" },
    update: { name: "Employee User", role: UserRole.EMPLOYEE, passwordHash, isActive: true },
    create: { email: "employee@appplus.local", name: "Employee User", role: UserRole.EMPLOYEE, passwordHash, isActive: true },
  });

  const [c1, c2, c3] = await Promise.all([
    prisma.customer.upsert({
      where: { internalCode: "CUST-0001" },
      update: { fullName: "Carlos Vega", phone: "+353870000001", address: "Dublin 1", updatedByUserId: admin.id },
      create: {
        internalCode: "CUST-0001",
        fullName: "Carlos Vega",
        phone: "+353870000001",
        address: "Dublin 1",
        notes: "Cliente frecuente",
        createdByUserId: admin.id,
        updatedByUserId: admin.id,
      },
    }),
    prisma.customer.upsert({
      where: { internalCode: "CUST-0002" },
      update: { fullName: "Ana Costa", phone: "+353870000002", address: "Dublin 2", updatedByUserId: supervisor.id },
      create: {
        internalCode: "CUST-0002",
        fullName: "Ana Costa",
        phone: "+353870000002",
        address: "Dublin 2",
        createdByUserId: supervisor.id,
        updatedByUserId: supervisor.id,
      },
    }),
    prisma.customer.upsert({
      where: { internalCode: "CUST-0003" },
      update: { fullName: "Luis Moreno", phone: "+353870000003", address: "Dublin 3", updatedByUserId: employee.id },
      create: {
        internalCode: "CUST-0003",
        fullName: "Luis Moreno",
        phone: "+353870000003",
        address: "Dublin 3",
        createdByUserId: employee.id,
        updatedByUserId: employee.id,
      },
    }),
  ]);

  await prisma.appSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, defaultCurrency: "EUR", maxImageSizeMb: 5, signedUrlTtlSeconds: 300, allowEmployeeViewSensitiveImages: false },
  });

  const activeVisit = await prisma.visit.upsert({
    where: { id: "seed-active-visit" },
    update: { customerId: c1.id, status: VisitStatus.ACTIVE, checkInByUserId: employee.id },
    create: { id: "seed-active-visit", customerId: c1.id, status: VisitStatus.ACTIVE, checkInByUserId: employee.id },
  });

  const closedVisit = await prisma.visit.upsert({
    where: { id: "seed-closed-visit" },
    update: {
      customerId: c2.id,
      status: VisitStatus.CHECKED_OUT,
      checkInByUserId: employee.id,
      checkOutByUserId: supervisor.id,
      checkOutAt: new Date(),
    },
    create: {
      id: "seed-closed-visit",
      customerId: c2.id,
      status: VisitStatus.CHECKED_OUT,
      checkInByUserId: employee.id,
      checkOutByUserId: supervisor.id,
      checkOutAt: new Date(),
    },
  });

  await prisma.visitFinancial.upsert({
    where: { visitId: closedVisit.id },
    update: { resultType: VisitResultType.WIN, amount: 120, currency: "EUR", recordedByUserId: supervisor.id },
    create: { visitId: closedVisit.id, resultType: VisitResultType.WIN, amount: 120, currency: "EUR", recordedByUserId: supervisor.id },
  });

  // Ensure only one active in seed
  await prisma.visit.deleteMany({
    where: { customerId: c3.id, status: VisitStatus.ACTIVE, id: { not: activeVisit.id } },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
