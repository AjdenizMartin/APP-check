import { CustomerAssetType } from "@prisma/client";
import { z } from "zod";

export const uploadCustomerAssetSchema = z.object({
  customerId: z.string().min(1),
  assetType: z.nativeEnum(CustomerAssetType),
});
