import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { canViewSensitiveImages } from "@/lib/permissions/roles";
import { readCustomerAsset } from "@/modules/customer-assets/service";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ assetId: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.appSetting.findUnique({ where: { id: 1 } });
  const canSee = canViewSensitiveImages(session.user.role as UserRole, settings?.allowEmployeeViewSensitiveImages ?? false);
  if (!canSee) {
    return NextResponse.json({ error: "forbidden_sensitive_image" }, { status: 403 });
  }

  try {
    const { assetId } = await context.params;
    const { asset, bytes } = await readCustomerAsset(assetId);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": asset.mimeType,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "private, max-age=120",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
