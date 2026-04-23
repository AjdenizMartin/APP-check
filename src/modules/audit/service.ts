import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export type AuditInput = {
  actorUserId?: string | null;
  entityType: string;
  entityId?: string | null;
  action: string;
  reason?: string | null;
  beforeJson?: unknown;
  afterJson?: unknown;
  ip?: string | null;
  userAgent?: string | null;
};

export async function createAuditLog(input: AuditInput, dbClient?: DbClient) {
  const db = dbClient ?? prisma;

  return db.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      reason: input.reason,
      beforeJson: input.beforeJson as Prisma.InputJsonValue | undefined,
      afterJson: input.afterJson as Prisma.InputJsonValue | undefined,
      ip: input.ip,
      userAgent: input.userAgent,
    },
  });
}

export async function listAuditLogs(filters: {
  actorRole: UserRole;
  page?: number;
  pageSize?: number;
  entityType?: string;
  action?: string;
}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 30));

  const where: Prisma.AuditLogWhereInput = {
    ...(filters.entityType ? { entityType: filters.entityType } : {}),
    ...(filters.action ? { action: { contains: filters.action, mode: "insensitive" } } : {}),
  };

  if (filters.actorRole === UserRole.SUPERVISOR) {
    where.entityType = { notIn: ["USER", "APP_SETTING"] };
  }

  if (filters.actorRole === UserRole.EMPLOYEE) {
    throw new Error("forbidden");
  }

  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        actor: { select: { name: true, email: true, role: true } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    rows,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
