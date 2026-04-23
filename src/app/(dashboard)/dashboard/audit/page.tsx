import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { listAuditLogs } from "@/modules/audit/service";

type SearchParams = Promise<{ page?: string; entityType?: string; action?: string }>;

export const dynamic = "force-dynamic";

export default async function AuditPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.SUPERVISOR) {
    redirect("/dashboard");
  }

  const { page, entityType, action } = await searchParams;
  const data = await listAuditLogs({
    actorRole: session.user.role,
    page: Number(page ?? 1),
    pageSize: 40,
    entityType,
    action,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
        <form className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-4" method="get">
          <input
            name="entityType"
            defaultValue={entityType ?? ""}
            placeholder="Entity (e.g. VISIT)"
            className="h-10 rounded-md border border-[var(--line)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--foreground)]"
          />
          <input
            name="action"
            defaultValue={action ?? ""}
            placeholder="Action (e.g. CHECK_OUT)"
            className="h-10 rounded-md border border-[var(--line)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--foreground)]"
          />
          <input
            type="number"
            min={1}
            name="page"
            defaultValue={String(data.page)}
            className="h-10 rounded-md border border-[var(--line)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--foreground)]"
          />
          <button className="h-10 rounded-md border border-[#8d6735] bg-[var(--accent)] px-4 text-sm font-medium text-[#1d1306] hover:bg-[var(--accent-strong)]">Apply filters</button>
        </form>
      </CardHeader>
      <CardContent>
        <div className="mb-3 text-sm text-[var(--text-muted)]">
          Total: {data.total} records | Page {data.page}/{data.totalPages}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--text-muted)]">
                <th className="p-2">Timestamp</th>
                <th className="p-2">Actor</th>
                <th className="p-2">Entity</th>
                <th className="p-2">Entity ID</th>
                <th className="p-2">Action</th>
                <th className="p-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((log) => (
                <tr key={log.id} className="border-b border-[var(--line)]/50 align-top">
                  <td className="p-2">{formatDateTime(log.createdAt)}</td>
                  <td className="p-2">{log.actor?.name ?? "-"}</td>
                  <td className="p-2">{log.entityType}</td>
                  <td className="p-2 text-xs">{log.entityId ?? "-"}</td>
                  <td className="p-2 font-medium">{log.action}</td>
                  <td className="p-2">{log.reason ?? "-"}</td>
                </tr>
              ))}
              {data.rows.length === 0 ? (
                <tr>
                  <td className="p-3 text-sm text-[var(--text-muted)]" colSpan={6}>
                    No results for selected filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
