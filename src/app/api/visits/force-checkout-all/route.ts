import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { forceCheckoutAll } from "@/modules/visits/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await forceCheckoutAll(body, session.user.id, session.user.role);
    return NextResponse.json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    const status = message === "forbidden" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
