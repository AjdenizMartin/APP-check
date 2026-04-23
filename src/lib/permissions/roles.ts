import { UserRole } from "@prisma/client";

export function hasRole(role: UserRole, allowed: UserRole[]) {
  return allowed.includes(role);
}

export function canForceCheckout(role: UserRole) {
  return hasRole(role, [UserRole.ADMIN, UserRole.SUPERVISOR]);
}

export function canCorrectFinancial(role: UserRole) {
  return hasRole(role, [UserRole.ADMIN, UserRole.SUPERVISOR]);
}

export function canManageUsers(role: UserRole) {
  return role === UserRole.ADMIN;
}

export function canViewFullAudit(role: UserRole) {
  return role === UserRole.ADMIN;
}

export function canViewSensitiveImages(role: UserRole, allowEmployeeViewSensitiveImages: boolean) {
  if (role === UserRole.ADMIN || role === UserRole.SUPERVISOR) {
    return true;
  }

  return allowEmployeeViewSensitiveImages;
}
