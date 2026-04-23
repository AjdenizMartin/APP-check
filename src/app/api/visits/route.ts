import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkInCustomer } from "@/modules/visits/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const visit = await checkInCustomer(body, session.user.id);
    return NextResponse.json({ data: visit }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
