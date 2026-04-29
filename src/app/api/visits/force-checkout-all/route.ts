import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRequestId, jsonError, logSensitiveAction } from "@/lib/observability/api";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { forceCheckoutAll } from "@/modules/visits/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const session = await auth();
  if (!session?.user) {
    return jsonError(requestId, "Unauthorized", 401, { action: "FORCE_CHECKOUT_ALL" });
  }

  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({
    key: `force-checkout:${session.user.id}:${ip}`,
    limit: 5,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) {
    return jsonError(requestId, "too_many_requests", 429, { action: "FORCE_CHECKOUT_ALL", userId: session.user.id });
  }

  try {
    const body = await request.json();
    const result = await forceCheckoutAll(body, session.user.id, session.user.role);

    logSensitiveAction({
      action: "FORCE_CHECKOUT_ALL",
      requestId,
      result: "success",
      userId: session.user.id,
      details: { affectedVisitsCount: result.affectedVisitsCount },
    });

    return NextResponse.json({ data: result, requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    logSensitiveAction({
      action: "FORCE_CHECKOUT_ALL",
      requestId,
      result: "error",
      userId: session.user.id,
    });
    const status = message === "forbidden" ? 403 : 400;
    return jsonError(requestId, message, status, { action: "FORCE_CHECKOUT_ALL", userId: session.user.id }, error);
  }
}
