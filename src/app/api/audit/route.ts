import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/auth/authorize";
import { UserRole } from "@prisma/client";
import { listAuditLogs } from "@/modules/audit/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const actor = await requireAnyRole([UserRole.ADMIN, UserRole.SUPERVISOR]);

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 30);
    const entityType = url.searchParams.get("entityType") ?? undefined;
    const action = url.searchParams.get("action") ?? undefined;

    const data = await listAuditLogs({
      actorRole: actor.role,
      page,
      pageSize,
      entityType,
      action,
    });

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    const status = message === "unauthorized" ? 401 : 403;
    return NextResponse.json({ error: message }, { status });
  }
}
