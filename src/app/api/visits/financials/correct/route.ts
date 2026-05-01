import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/auth/authorize";
import { UserRole } from "@prisma/client";
import { mapNetToFinancial } from "@/lib/financials/visit-result";
import { correctVisitFinancial } from "@/modules/visits/service";
import { correctFinancialSchema } from "@/modules/visits/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const actor = await requireAnyRole([UserRole.ADMIN, UserRole.SUPERVISOR]);
    const body = correctFinancialSchema.parse(await request.json());
    const financialInput =
      "net" in body ? mapNetToFinancial(body.net) : { resultType: body.resultType, amount: body.amount };

    const result = await correctVisitFinancial({
      visitId: body.visitId,
      resultType: financialInput.resultType,
      amount: financialInput.amount,
      currency: body.currency,
      reason: body.reason,
      actorUserId: actor.id,
      actorRole: actor.role,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    const status = message === "unauthorized" ? 401 : message === "forbidden" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
