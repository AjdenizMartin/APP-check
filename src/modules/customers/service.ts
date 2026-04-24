import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/modules/audit/service";
import { createCustomerSchema, customerSearchSchema, updateCustomerSchema } from "@/modules/customers/schemas";

function normalizeOptional(value?: string) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

async function generateInternalCode() {
  const count = await prisma.customer.count();
  return `CUST-${String(count + 1).padStart(4, "0")}`;
}

export async function searchCustomers(rawInput: unknown) {
  const parsed = customerSearchSchema.parse(rawInput);
  const q = parsed.q?.trim();

  const customers = await prisma.customer.findMany({
    where: {
      isActive: true,
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
              { internalCode: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      visits: {
        where: { status: "ACTIVE" },
        select: { id: true },
        take: 1,
      },
    },
  });

  return customers.map((customer) => {
    const activeVisitId = customer.visits[0]?.id ?? null;

    return {
      id: customer.id,
      internalCode: customer.internalCode,
      fullName: customer.fullName,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      createdByUserId: customer.createdByUserId,
      updatedByUserId: customer.updatedByUserId,
      hasActiveVisit: Boolean(activeVisitId),
      activeVisitId,
    };
  });
}

export async function getCustomerDetail(customerId: string) {
  return prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      assets: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
      visits: {
        orderBy: { checkInAt: "desc" },
        take: 10,
        include: {
          checkInBy: { select: { name: true } },
          checkOutBy: { select: { name: true } },
          financial: true,
        },
      },
    },
  });
}

export async function getCustomersCount() {
  return prisma.customer.count();
}

export async function createCustomer(rawInput: unknown, actorUserId: string) {
  const parsed = createCustomerSchema.parse(rawInput);

  const customer = await prisma.customer.create({
    data: {
      internalCode: normalizeOptional(parsed.internalCode) ?? (await generateInternalCode()),
      fullName: parsed.fullName.trim(),
      phone: parsed.phone.trim(),
      address: parsed.address.trim(),
      notes: normalizeOptional(parsed.notes),
      createdByUserId: actorUserId,
      updatedByUserId: actorUserId,
    },
  });

  await createAuditLog({
    actorUserId,
    entityType: "CUSTOMER",
    entityId: customer.id,
    action: "CUSTOMER_CREATED",
    afterJson: customer,
  });

  return customer;
}

export async function updateCustomer(rawInput: unknown, actorUserId: string, reason?: string) {
  const parsed = updateCustomerSchema.parse(rawInput);

  const previous = await prisma.customer.findUnique({ where: { id: parsed.id } });
  if (!previous || !previous.isActive) {
    throw new Error("customer_not_found");
  }

  const updated = await prisma.customer.update({
    where: { id: parsed.id },
    data: {
      internalCode: normalizeOptional(parsed.internalCode) ?? previous.internalCode,
      fullName: parsed.fullName.trim(),
      phone: parsed.phone.trim(),
      address: parsed.address.trim(),
      notes: normalizeOptional(parsed.notes),
      updatedByUserId: actorUserId,
    },
  });

  await createAuditLog({
    actorUserId,
    entityType: "CUSTOMER",
    entityId: updated.id,
    action: "CUSTOMER_UPDATED",
    reason,
    beforeJson: previous,
    afterJson: updated,
  });

  return updated;
}
