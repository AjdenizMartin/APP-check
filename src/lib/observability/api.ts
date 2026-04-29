import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { generateRequestId, logger } from "@/lib/logging/logger";

export function getRequestId(request: Request) {
  return request.headers.get("x-request-id") ?? generateRequestId();
}

export function jsonError(
  requestId: string,
  message: string,
  status = 500,
  context?: Record<string, unknown>,
  error?: unknown,
) {
  if (status >= 500) {
    if (error instanceof Error) {
      Sentry.captureException(error, { extra: { requestId, ...context } });
    } else {
      Sentry.captureMessage(message, { level: "error", extra: { requestId, ...context } });
    }
  }

  logger.error("api_error", {
    requestId,
    result: "error",
    status,
    error: message,
    ...context,
  });

  return NextResponse.json({ error: message, requestId }, { status });
}

export function logSensitiveAction(input: {
  action: string;
  requestId: string;
  result: "success" | "error";
  userId?: string;
  customerId?: string;
  visitId?: string;
  details?: Record<string, unknown>;
}) {
  logger.info("sensitive_action", {
    action: input.action,
    requestId: input.requestId,
    result: input.result,
    userId: input.userId,
    customerId: input.customerId,
    visitId: input.visitId,
    ...(input.details ?? {}),
  });
}
