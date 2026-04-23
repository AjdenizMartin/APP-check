import Link from "next/link";
import { ShieldCheck, Users, History, ClipboardList, LayoutDashboard } from "lucide-react";
import { UserRole } from "@prisma/client";
import { logoutAction } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";

function NavLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:border-[#7f6239] hover:bg-[#1a342c]"
    >
      {icon}
      {label}
    </Link>
  );
}

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name?: string | null; role: UserRole };
}) {
  const canViewAudit = user.role === UserRole.ADMIN || user.role === UserRole.SUPERVISOR;
  const canManageUsers = user.role === UserRole.ADMIN;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(9,20,16,0.94)] shadow-[0_12px_32px_-26px_rgba(0,0,0,0.9)]">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="text-xl font-semibold tracking-tight text-[var(--foreground)]">App+</p>
            <p className="text-xs text-[var(--text-muted)]">Casino Reception Operations</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <NavLink href="/dashboard" label="Overview" icon={<LayoutDashboard className="h-4 w-4" />} />
            <NavLink href="/dashboard/customers" label="Customers" icon={<Users className="h-4 w-4" />} />
            <NavLink href="/dashboard/visits" label="Active Visits" icon={<ClipboardList className="h-4 w-4" />} />
            <NavLink href="/dashboard/history" label="Daily History" icon={<History className="h-4 w-4" />} />
            {canViewAudit ? <NavLink href="/dashboard/audit" label="Audit" icon={<ShieldCheck className="h-4 w-4" />} /> : null}
            {canManageUsers ? <NavLink href="/dashboard/admin/users" label="Users" icon={<Users className="h-4 w-4" />} /> : null}
          </nav>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-1 text-right text-xs text-[var(--text-muted)]">
              <p className="font-semibold text-[var(--foreground)]">{user.name}</p>
              <p>{user.role}</p>
            </div>
            <form action={logoutAction}>
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl p-4 md:p-6">{children}</main>
    </div>
  );
}
