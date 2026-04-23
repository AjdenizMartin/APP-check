import path from "node:path";
import { CustomerAssetType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getPrivateObject, putPrivateObject } from "@/lib/s3/storage";
import { createAuditLog } from "@/modules/audit/service";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
}

export async function uploadCustomerAsset(input: {
  customerId: string;
  assetType: CustomerAssetType;
  fileName: string;
  mimeType: string;
  bytes: Buffer;
  uploadedByUserId: string;
}) {
  if (!allowedMimeTypes.has(input.mimeType)) {
    throw new Error("invalid_asset_mime_type");
  }

  const settings = await prisma.appSetting.findUnique({ where: { id: 1 } });
  const maxBytes = (settings?.maxImageSizeMb ?? 5) * 1024 * 1024;
  if (input.bytes.length > maxBytes) {
    throw new Error("asset_too_large");
  }

  const customer = await prisma.customer.findUnique({ where: { id: input.customerId } });
  if (!customer || !customer.isActive) {
    throw new Error("customer_not_found");
  }

  const ext = path.extname(input.fileName || "upload").replace(".", "") || "bin";
  const key = `customers/${input.customerId}/${input.assetType}/${Date.now()}-${safeFileName(input.fileName)}.${ext}`;

  await putPrivateObject(key, input.bytes, input.mimeType);

  const result = await prisma.$transaction(async (tx) => {
    const previousActive = await tx.customerAsset.findFirst({
      where: { customerId: input.customerId, assetType: input.assetType, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (previousActive) {
      await tx.customerAsset.update({
        where: { id: previousActive.id },
        data: { isActive: false, replacedAt: new Date() },
      });
    }

    const created = await tx.customerAsset.create({
      data: {
        customerId: input.customerId,
        assetType: input.assetType,
        storageKey: key,
        mimeType: input.mimeType,
        sizeBytes: input.bytes.length,
        uploadedByUserId: input.uploadedByUserId,
      },
    });

    await createAuditLog({
      actorUserId: input.uploadedByUserId,
      entityType: "CUSTOMER_ASSET",
      entityId: created.id,
      action: "CUSTOMER_ASSET_UPLOADED",
      beforeJson: previousActive,
      afterJson: created,
    }, tx);

    return created;
  });

  return result;
}

export async function readCustomerAsset(assetId: string) {
  const asset = await prisma.customerAsset.findUnique({
    where: { id: assetId },
    include: { customer: true },
  });

  if (!asset || !asset.isActive || !asset.customer.isActive) {
    throw new Error("asset_not_found");
  }

  const bytes = await getPrivateObject(asset.storageKey);
  return { asset, bytes };
}
