import { UserRole } from "@prisma/client";
import { auth } from "@/auth";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("unauthorized");
  }

  return session.user;
}

export async function requireAnyRole(allowedRoles: UserRole[]) {
  const user = await requireSession();
  if (!allowedRoles.includes(user.role as UserRole)) {
    throw new Error("forbidden");
  }

  return user;
}

export async function requireAdmin() {
  return requireAnyRole([UserRole.ADMIN]);
}

export async function requireSupervisorOrAdmin() {
  return requireAnyRole([UserRole.ADMIN, UserRole.SUPERVISOR]);
}
