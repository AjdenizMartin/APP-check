import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/modules/audit/service";
import { createUserSchema, updateUserSchema } from "@/modules/users/schemas";

export async function listUsers() {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createUser(rawInput: unknown, actorUserId: string) {
  const parsed = createUserSchema.parse(rawInput);
  const passwordHash = await bcrypt.hash(parsed.password, 12);

  const created = await prisma.user.create({
    data: {
      email: parsed.email.toLowerCase(),
      name: parsed.name.trim(),
      role: parsed.role,
      passwordHash,
      isActive: true,
    },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
  });

  await createAuditLog({
    actorUserId,
    entityType: "USER",
    entityId: created.id,
    action: "USER_CREATED",
    afterJson: created,
  });

  return created;
}

export async function updateUser(userId: string, rawInput: unknown, actorUserId: string) {
  const parsed = updateUserSchema.parse(rawInput);
  const previous = await prisma.user.findUnique({ where: { id: userId } });

  if (!previous) {
    throw new Error("user_not_found");
  }

  const data: {
    name?: string;
    email?: string;
    role?: UserRole;
    isActive?: boolean;
    passwordHash?: string;
  } = {};

  if (typeof parsed.name !== "undefined") data.name = parsed.name.trim();
  if (typeof parsed.email !== "undefined") data.email = parsed.email.toLowerCase();
  if (typeof parsed.role !== "undefined") data.role = parsed.role;
  if (typeof parsed.isActive !== "undefined") data.isActive = parsed.isActive;
  if (typeof parsed.password !== "undefined") data.passwordHash = await bcrypt.hash(parsed.password, 12);

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true },
  });

  await createAuditLog({
    actorUserId,
    entityType: "USER",
    entityId: updated.id,
    action: "USER_UPDATED",
    beforeJson: {
      id: previous.id,
      email: previous.email,
      name: previous.name,
      role: previous.role,
      isActive: previous.isActive,
    },
    afterJson: updated,
  });

  return updated;
}
