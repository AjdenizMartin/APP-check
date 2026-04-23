import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { searchCustomers, createCustomer } from "@/modules/customers/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const customers = await searchCustomers({ q });
  return NextResponse.json({ data: customers });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const customer = await createCustomer(body, session.user.id);
    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
