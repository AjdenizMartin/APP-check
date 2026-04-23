import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/authorize";
import { updateUser } from "@/modules/users/service";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const actor = await requireAdmin();
    const { userId } = await context.params;
    const body = await request.json();
    const user = await updateUser(userId, body, actor.id);
    return NextResponse.json({ data: user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    const status = message === "unauthorized" ? 401 : message === "forbidden" ? 403 : message === "user_not_found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
