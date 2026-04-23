import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/authorize";
import { createUser, listUsers } from "@/modules/users/service";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const users = await listUsers();
    return NextResponse.json({ data: users });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    const status = message === "unauthorized" ? 401 : 403;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAdmin();
    const body = await request.json();
    const user = await createUser(body, actor.id);
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    const status = message === "unauthorized" ? 401 : message === "forbidden" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
