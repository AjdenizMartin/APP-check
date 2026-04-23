import { VisitStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getVisitHistory } from "@/modules/visits/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ? new Date(String(searchParams.get("date"))) : undefined;
  const statusParam = searchParams.get("status");
  const status = statusParam && Object.values(VisitStatus).includes(statusParam as VisitStatus)
    ? (statusParam as VisitStatus)
    : undefined;

  const customerQuery = searchParams.get("customer") ?? undefined;
  const employeeId = searchParams.get("employeeId") ?? undefined;

  const data = await getVisitHistory({ date, status, customerQuery, employeeId });
  return NextResponse.json({ data });
}
