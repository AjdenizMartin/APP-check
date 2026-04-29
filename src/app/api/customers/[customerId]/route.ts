import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRequestId, jsonError, logSensitiveAction } from "@/lib/observability/api";
import { deactivateCustomer, getCustomerDetail, updateCustomer } from "@/modules/customers/service";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ customerId: string }> }) {
  const requestId = getRequestId(request);
  const session = await auth();
  if (!session?.user) {
    return jsonError(requestId, "Unauthorized", 401, { action: "CUSTOMER_GET" });
  }

  const { customerId } = await context.params;
  const customer = await getCustomerDetail(customerId);

  if (!customer) {
    return jsonError(requestId, "Not found", 404, { action: "CUSTOMER_GET", userId: session.user.id, customerId });
  }

  return NextResponse.json({ data: customer, requestId });
}

export async function PATCH(request: Request, context: { params: Promise<{ customerId: string }> }) {
  const requestId = getRequestId(request);
  const session = await auth();
  if (!session?.user) {
    return jsonError(requestId, "Unauthorized", 401, { action: "CUSTOMER_UPDATE" });
  }

  try {
    const { customerId } = await context.params;
    const body = await request.json();
    const customer = await updateCustomer({ ...body, id: customerId }, session.user.id, body.reason);

    logSensitiveAction({
      action: "CUSTOMER_UPDATE",
      requestId,
      result: "success",
      userId: session.user.id,
      customerId,
    });

    return NextResponse.json({ data: customer, requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    logSensitiveAction({
      action: "CUSTOMER_UPDATE",
      requestId,
      result: "error",
      userId: session.user.id,
    });
    return jsonError(requestId, message, 400, { action: "CUSTOMER_UPDATE", userId: session.user.id }, error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ customerId: string }> }) {
  const requestId = getRequestId(request);
  const session = await auth();
  if (!session?.user) {
    return jsonError(requestId, "Unauthorized", 401, { action: "CUSTOMER_DEACTIVATE" });
  }

  try {
    const { customerId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason : undefined;
    const customer = await deactivateCustomer(customerId, session.user.id, reason);

    logSensitiveAction({
      action: "CUSTOMER_DEACTIVATE",
      requestId,
      result: "success",
      userId: session.user.id,
      customerId,
    });

    return NextResponse.json({ data: customer, requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    logSensitiveAction({
      action: "CUSTOMER_DEACTIVATE",
      requestId,
      result: "error",
      userId: session.user.id,
    });
    return jsonError(requestId, message, 400, { action: "CUSTOMER_DEACTIVATE", userId: session.user.id }, error);
  }
}
