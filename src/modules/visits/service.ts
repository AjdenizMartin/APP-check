import { Prisma, UserRole, VisitFinancialStatus, VisitResultType, VisitStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { canCorrectFinancial, canForceCheckout } from "@/lib/permissions/roles";
import { createAuditLog } from "@/modules/audit/service";
import { checkInSchema, checkOutSchema, forceCheckoutSchema } from "@/modules/visits/schemas";

export async function checkInCustomer(rawInput: unknown, actorUserId: string) {
  const parsed = checkInSchema.parse(rawInput);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.visit.findFirst({
      where: { customerId: parsed.customerId, status: VisitStatus.ACTIVE },
      select: { id: true },
    });

    if (existing) {
      throw new Error("active_visit_already_exists");
    }

    const visit = await tx.visit.create({
      data: {
        customerId: parsed.customerId,
        checkInByUserId: actorUserId,
      },
    });

    await createAuditLog({
      actorUserId,
      entityType: "VISIT",
      entityId: visit.id,
      action: "CHECK_IN",
      afterJson: visit,
    }, tx);

    return visit;
  });
}

export async function checkOutVisit(rawInput: unknown, actorUserId: string) {
  const parsed = checkOutSchema.parse(rawInput);

  return prisma.$transaction(async (tx) => {
    const visit = await tx.visit.findUnique({
      where: { id: parsed.visitId },
      include: { financial: true },
    });

    if (!visit || visit.status !== VisitStatus.ACTIVE) {
      throw new Error("active_visit_not_found");
    }

    if (visit.financial) {
      throw new Error("visit_financial_already_recorded");
    }

    const closedVisit = await tx.visit.update({
      where: { id: visit.id },
      data: {
        status: VisitStatus.CHECKED_OUT,
        checkOutAt: new Date(),
        checkOutByUserId: actorUserId,
      },
    });

    const financial = await tx.visitFinancial.create({
      data: {
        visitId: visit.id,
        resultType: parsed.resultType,
        amount: new Prisma.Decimal(parsed.amount),
        currency: parsed.currency,
        status: VisitFinancialStatus.RECORDED,
        recordedByUserId: actorUserId,
      },
    });

    await createAuditLog({
      actorUserId,
      entityType: "VISIT",
      entityId: visit.id,
      action: "CHECK_OUT",
      afterJson: { closedVisit, financial },
    }, tx);

    return { visit: closedVisit, financial };
  });
}

export async function correctVisitFinancial(input: {
  visitId: string;
  resultType: VisitResultType;
  amount: number;
  currency: string;
  reason: string;
  actorUserId: string;
  actorRole: UserRole;
}) {
  if (!canCorrectFinancial(input.actorRole)) {
    throw new Error("forbidden");
  }
  if (!input.reason?.trim()) {
    throw new Error("correction_reason_required");
  }
  if (input.resultType === VisitResultType.EVEN && input.amount !== 0) {
    throw new Error("even_amount_must_be_zero");
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.visitFinancial.findUnique({ where: { visitId: input.visitId } });
    if (!existing) {
      throw new Error("visit_financial_not_found");
    }

    const updated = await tx.visitFinancial.update({
      where: { id: existing.id },
      data: {
        resultType: input.resultType,
        amount: new Prisma.Decimal(input.amount),
        currency: input.currency,
        status: VisitFinancialStatus.CORRECTED,
        correctionReason: input.reason,
        correctedByUserId: input.actorUserId,
        correctedAt: new Date(),
      },
    });

    await createAuditLog({
      actorUserId: input.actorUserId,
      entityType: "VISIT_FINANCIAL",
      entityId: existing.id,
      action: "VISIT_FINANCIAL_CORRECTED",
      reason: input.reason,
      beforeJson: existing,
      afterJson: updated,
    }, tx);

    return updated;
  });
}

export async function forceCheckoutAll(rawInput: unknown, actorUserId: string, actorRole: UserRole) {
  if (!canForceCheckout(actorRole)) {
    throw new Error("forbidden");
  }

  const parsed = forceCheckoutSchema.parse(rawInput);

  return prisma.$transaction(async (tx) => {
    const activeVisits = await tx.visit.findMany({ where: { status: VisitStatus.ACTIVE }, select: { id: true } });

    const closureEvent = await tx.closureEvent.create({
      data: {
        actionType: "FORCE_CHECKOUT_ALL",
        reason: parsed.reason || "Operator initiated force checkout",
        executedByUserId: actorUserId,
        affectedVisitsCount: activeVisits.length,
      },
    });

    if (activeVisits.length > 0) {
      await tx.visit.updateMany({
        where: { id: { in: activeVisits.map((v) => v.id) } },
        data: {
          status: VisitStatus.FORCED_OUT,
          checkOutAt: new Date(),
          checkOutByUserId: actorUserId,
          forcedReason: parsed.reason || "Operator initiated force checkout",
          closureEventId: closureEvent.id,
        },
      });
    }

    await createAuditLog({
      actorUserId,
      entityType: "CLOSURE_EVENT",
      entityId: closureEvent.id,
      action: "FORCE_CHECKOUT_ALL",
      reason: parsed.reason || "Operator initiated force checkout",
      afterJson: {
        affectedVisitsCount: activeVisits.length,
        visitIds: activeVisits.map((v) => v.id),
      },
    }, tx);

    return closureEvent;
  });
}

export async function getOperationalDashboard() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const [activeVisits, todayCheckIns, todayCheckOuts] = await Promise.all([
    prisma.visit.findMany({
      where: { status: VisitStatus.ACTIVE },
      orderBy: { checkInAt: "desc" },
      include: {
        customer: true,
        checkInBy: { select: { name: true } },
      },
    }),
    prisma.visit.count({ where: { checkInAt: { gte: start, lte: end } } }),
    prisma.visit.count({ where: { checkOutAt: { gte: start, lte: end } } }),
  ]);

  return { activeVisits, todayCheckIns, todayCheckOuts };
}

export async function getVisitHistory(filters: {
  date?: Date;
  status?: VisitStatus;
  customerQuery?: string;
  employeeId?: string;
}) {
  const targetDate = filters.date ?? new Date();
  const start = new Date(targetDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(targetDate);
  end.setHours(23, 59, 59, 999);

  return prisma.visit.findMany({
    where: {
      checkInAt: { gte: start, lte: end },
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.employeeId ? { checkInByUserId: filters.employeeId } : {}),
      ...(filters.customerQuery
        ? {
            customer: {
              OR: [
                { fullName: { contains: filters.customerQuery, mode: "insensitive" } },
                { phone: { contains: filters.customerQuery, mode: "insensitive" } },
                { internalCode: { contains: filters.customerQuery, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    },
    orderBy: { checkInAt: "desc" },
    include: {
      customer: true,
      checkInBy: { select: { name: true } },
      checkOutBy: { select: { name: true } },
      financial: true,
    },
  });
}
