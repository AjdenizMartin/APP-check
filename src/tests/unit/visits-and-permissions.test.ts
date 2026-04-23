import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole, VisitResultType, VisitStatus } from "@prisma/client";

const prismaMock = {
  $transaction: vi.fn(),
};

vi.mock("@/lib/db/prisma", () => ({
  prisma: prismaMock,
}));

const auditMock = {
  createAuditLog: vi.fn().mockResolvedValue(null),
};

vi.mock("@/modules/audit/service", () => auditMock);

describe("Visits and permissions rules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no permite doble visita activa", async () => {
    prismaMock.$transaction.mockImplementation(async (fn: (tx: any) => Promise<unknown>) => {
      const tx = {
        visit: {
          findFirst: vi.fn().mockResolvedValue({ id: "existing" }),
          create: vi.fn(),
        },
      };

      return fn(tx);
    });

    const { checkInCustomer } = await import("@/modules/visits/service");

    await expect(checkInCustomer({ customerId: "c1" }, "u1")).rejects.toThrow("active_visit_already_exists");
  });

  it("check-out correcto registra financiero", async () => {
    const updateVisit = vi.fn().mockResolvedValue({ id: "v1", status: VisitStatus.CHECKED_OUT });
    const createFinancial = vi.fn().mockResolvedValue({ id: "f1", resultType: VisitResultType.WIN, amount: 10 });

    prismaMock.$transaction.mockImplementation(async (fn: (tx: any) => Promise<unknown>) => {
      const tx = {
        visit: {
          findUnique: vi.fn().mockResolvedValue({ id: "v1", status: VisitStatus.ACTIVE, financial: null }),
          update: updateVisit,
        },
        visitFinancial: {
          create: createFinancial,
        },
      };

      return fn(tx);
    });

    const { checkOutVisit } = await import("@/modules/visits/service");

    const result = await checkOutVisit({ visitId: "v1", resultType: VisitResultType.WIN, amount: 10, currency: "EUR" }, "u1");

    expect(result.visit.status).toBe(VisitStatus.CHECKED_OUT);
    expect(createFinancial).toHaveBeenCalledTimes(1);
  });

  it("force checkout cierra todas las visitas activas", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 2 });

    prismaMock.$transaction.mockImplementation(async (fn: (tx: any) => Promise<unknown>) => {
      const tx = {
        visit: {
          findMany: vi.fn().mockResolvedValue([{ id: "v1" }, { id: "v2" }]),
          updateMany,
        },
        closureEvent: {
          create: vi.fn().mockResolvedValue({ id: "ce1", affectedVisitsCount: 2 }),
        },
      };

      return fn(tx);
    });

    const { forceCheckoutAll } = await import("@/modules/visits/service");

    await forceCheckoutAll({ reason: "Cierre del local" }, "u1", UserRole.SUPERVISOR);

    expect(updateMany).toHaveBeenCalledTimes(1);
    expect(updateMany.mock.calls[0][0].data.status).toBe(VisitStatus.FORCED_OUT);
  });

  it("correccion financiera requiere rol supervisor/admin", async () => {
    const { correctVisitFinancial } = await import("@/modules/visits/service");

    await expect(
      correctVisitFinancial({
        visitId: "v1",
        resultType: VisitResultType.WIN,
        amount: 20,
        currency: "EUR",
        reason: "ajuste",
        actorUserId: "u1",
        actorRole: UserRole.EMPLOYEE,
      }),
    ).rejects.toThrow("forbidden");
  });

  it("helpers de permisos por rol y sensibilidad", async () => {
    const { canForceCheckout, canCorrectFinancial, canViewSensitiveImages } = await import("@/lib/permissions/roles");

    expect(canForceCheckout(UserRole.EMPLOYEE)).toBe(false);
    expect(canForceCheckout(UserRole.ADMIN)).toBe(true);
    expect(canCorrectFinancial(UserRole.SUPERVISOR)).toBe(true);

    expect(canViewSensitiveImages(UserRole.EMPLOYEE, false)).toBe(false);
    expect(canViewSensitiveImages(UserRole.EMPLOYEE, true)).toBe(true);
    expect(canViewSensitiveImages(UserRole.SUPERVISOR, false)).toBe(true);
  });
});
