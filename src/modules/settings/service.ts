import { prisma } from "@/lib/db/prisma";

export async function getAppSettings() {
  return prisma.appSetting.findUnique({ where: { id: 1 } });
}

export async function ensureDefaultSettings() {
  return prisma.appSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      defaultCurrency: "EUR",
      maxImageSizeMb: 5,
      signedUrlTtlSeconds: 300,
      allowEmployeeViewSensitiveImages: false,
    },
  });
}
