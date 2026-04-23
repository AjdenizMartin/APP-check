import { CustomerAssetType } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadCustomerAsset } from "@/modules/customer-assets/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const customerId = String(formData.get("customerId") ?? "");
    const assetType = String(formData.get("assetType") ?? "");
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "file_required" }, { status: 400 });
    }

    if (!Object.values(CustomerAssetType).includes(assetType as CustomerAssetType)) {
      return NextResponse.json({ error: "invalid_asset_type" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const asset = await uploadCustomerAsset({
      customerId,
      assetType: assetType as CustomerAssetType,
      fileName: file.name,
      mimeType: file.type,
      bytes: buffer,
      uploadedByUserId: session.user.id,
    });

    return NextResponse.json({ data: asset }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
