import { VisitResultType } from "@prisma/client";
import { z } from "zod";

export const checkInSchema = z.object({
  customerId: z.string().min(1),
});

const checkoutLegacySchema = z
  .object({
    visitId: z.string().min(1),
    resultType: z.nativeEnum(VisitResultType),
    amount: z.coerce.number().min(0),
    currency: z.string().min(3).max(3).default("EUR"),
  })
  .superRefine((data, ctx) => {
    if (data.resultType === VisitResultType.EVEN && data.amount !== 0) {
      ctx.addIssue({ code: "custom", message: "EVEN requiere amount=0", path: ["amount"] });
    }
  });

const checkoutByInOutSchema = z.object({
  visitId: z.string().min(1),
  amountIn: z.coerce.number().min(0),
  amountOut: z.coerce.number().min(0),
  result: z.coerce.number().optional(),
  currency: z.string().min(3).max(3).default("EUR"),
});

export const checkOutSchema = z.union([checkoutByInOutSchema, checkoutLegacySchema]);

export const forceCheckoutSchema = z.object({
  reason: z.string().min(5).max(300).optional(),
});

const correctionByNetSchema = z.object({
  visitId: z.string().min(1),
  net: z.coerce.number().finite(),
  currency: z.string().length(3),
  reason: z.string().min(5),
});

const correctionLegacySchema = z.object({
  visitId: z.string().min(1),
  resultType: z.nativeEnum(VisitResultType),
  amount: z.coerce.number().min(0),
  currency: z.string().length(3),
  reason: z.string().min(5),
});

export const correctFinancialSchema = z.union([correctionByNetSchema, correctionLegacySchema]);
