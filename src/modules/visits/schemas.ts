import { VisitResultType } from "@prisma/client";
import { z } from "zod";

export const checkInSchema = z.object({
  customerId: z.string().min(1),
});

export const checkOutSchema = z
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

export const forceCheckoutSchema = z.object({
  reason: z.string().min(5).max(300).optional(),
});
