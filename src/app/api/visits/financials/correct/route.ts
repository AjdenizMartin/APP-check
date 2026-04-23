import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/auth/authorize";
import { UserRole, VisitResultType } from "@prisma/client";
import { correctVisitFinancial } from "@/modules/visits/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const actor = await requireAnyRole([UserRole.ADMIN, UserRole.SUPERVISOR]);
    const body = await request.json();

    const result = await correctVisitFinancial({
      visitId: String(body.visitId),
      resultType: body.resultType as VisitResultType,
      amount: Number(body.amount),
      currency: String(body.currency ?? "EUR"),
      reason: String(body.reason ?? ""),
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
