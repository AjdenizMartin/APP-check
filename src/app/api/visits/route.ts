import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRequestId, jsonError, logSensitiveAction } from "@/lib/observability/api";
import { checkInCustomer } from "@/modules/visits/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const session = await auth();
  if (!session?.user) {
    return jsonError(requestId, "Unauthorized", 401, { action: "CHECK_IN" });
  }

  try {
    const body = await request.json();
    const visit = await checkInCustomer(body, session.user.id);

    logSensitiveAction({
      action: "CHECK_IN",
      requestId,
      result: "success",
      userId: session.user.id,
      customerId: String(body?.customerId ?? ""),
      visitId: visit.id,
    });

    return NextResponse.json({ data: visit, requestId }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    logSensitiveAction({
      action: "CHECK_IN",
      requestId,
      result: "error",
      userId: session.user.id,
    });
    const status = message === "active_visit_already_exists" ? 409 : 400;
    return jsonError(requestId, message, status, { action: "CHECK_IN", userId: session.user.id }, error);
  }
}
