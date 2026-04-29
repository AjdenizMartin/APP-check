import { CustomerAssetType } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRequestId, jsonError, logSensitiveAction } from "@/lib/observability/api";
import { uploadCustomerAsset } from "@/modules/customer-assets/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const session = await auth();
  if (!session?.user) {
    return jsonError(requestId, "Unauthorized", 401, { action: "CUSTOMER_ASSET_UPLOAD" });
  }

  try {
    const formData = await request.formData();
    const customerId = String(formData.get("customerId") ?? "");
    const assetType = String(formData.get("assetType") ?? "");
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return jsonError(requestId, "file_required", 400, { action: "CUSTOMER_ASSET_UPLOAD", userId: session.user.id, customerId });
    }

    if (!Object.values(CustomerAssetType).includes(assetType as CustomerAssetType)) {
      return jsonError(requestId, "invalid_asset_type", 400, { action: "CUSTOMER_ASSET_UPLOAD", userId: session.user.id, customerId });
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

    logSensitiveAction({
      action: "CUSTOMER_ASSET_UPLOAD",
      requestId,
      result: "success",
      userId: session.user.id,
      customerId,
      details: { assetId: asset.id, assetType: asset.assetType },
    });

    return NextResponse.json({ data: asset, requestId }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    logSensitiveAction({
      action: "CUSTOMER_ASSET_UPLOAD",
      requestId,
      result: "error",
      userId: session.user.id,
    });
    return jsonError(requestId, message, 400, { action: "CUSTOMER_ASSET_UPLOAD", userId: session.user.id }, error);
  }
}
