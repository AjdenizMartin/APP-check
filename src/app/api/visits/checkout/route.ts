import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRequestId, jsonError, logSensitiveAction } from "@/lib/observability/api";
import { checkOutVisit } from "@/modules/visits/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const session = await auth();
  if (!session?.user) {
    return jsonError(requestId, "Unauthorized", 401, { action: "CHECK_OUT" });
  }

  try {
    const body = await request.json();
    const result = await checkOutVisit(body, session.user.id);

    logSensitiveAction({
      action: "CHECK_OUT",
      requestId,
      result: "success",
      userId: session.user.id,
      visitId: String(body?.visitId ?? ""),
    });

    return NextResponse.json({ data: result, requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    logSensitiveAction({
      action: "CHECK_OUT",
      requestId,
      result: "error",
      userId: session.user.id,
    });
    const status = message === "active_visit_not_found" ? 404 : 400;
    return jsonError(requestId, message, status, { action: "CHECK_OUT", userId: session.user.id }, error);
  }
}
