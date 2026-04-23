import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCustomerDetail, updateCustomer } from "@/modules/customers/service";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ customerId: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { customerId } = await context.params;
  const customer = await getCustomerDetail(customerId);

  if (!customer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: customer });
}

export async function PATCH(request: Request, context: { params: Promise<{ customerId: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { customerId } = await context.params;
    const body = await request.json();
    const customer = await updateCustomer({ ...body, id: customerId }, session.user.id, body.reason);
    return NextResponse.json({ data: customer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
