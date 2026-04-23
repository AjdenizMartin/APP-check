import { Users, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canForceCheckout } from "@/lib/permissions/roles";
import { formatTime } from "@/lib/format";
import { getOperationalDashboard } from "@/modules/visits/service";
import { ForceCheckoutForm } from "@/components/visits/force-checkout-form";
import { ReceptionShortcuts } from "@/components/dashboard/reception-shortcuts";

export const dynamic = "force-dynamic";

function KpiCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-sm font-medium text-[var(--text-muted)]">{title}</CardTitle>
        <div className="rounded-full border border-[var(--line)] bg-[rgba(181,138,82,0.15)] p-2 text-[#e4c79e]">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">{value}</p>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const data = await getOperationalDashboard();

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard title="Customers Inside" value={data.activeVisits.length} icon={<Users className="h-4 w-4" />} />
        <KpiCard title="Today Check-ins" value={data.todayCheckIns} icon={<ArrowDownCircle className="h-4 w-4" />} />
        <KpiCard title="Today Check-outs" value={data.todayCheckOuts} icon={<ArrowUpCircle className="h-4 w-4" />} />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Live Floor Board</CardTitle>
            <div className="flex items-center gap-2">
              <a
                href="/dashboard/history"
                className="rounded-md border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-1 text-sm hover:bg-[#193229]"
              >
                Daily History
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--text-muted)]">
                    <th className="p-2">Customer</th>
                    <th className="p-2">Check-in Time</th>
                    <th className="p-2">Handled By</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.activeVisits.map((visit) => (
                    <tr key={visit.id} className="border-b border-[var(--line)]/50">
                      <td className="p-2 font-medium">{visit.customer.fullName}</td>
                      <td className="p-2">{formatTime(visit.checkInAt)}</td>
                      <td className="p-2">{visit.checkInBy.name}</td>
                      <td className="p-2">
                        <Badge>ACTIVE</Badge>
                      </td>
                    </tr>
                  ))}
                  {data.activeVisits.length === 0 ? (
                    <tr>
                      <td className="p-4 text-sm text-[var(--text-muted)]" colSpan={4}>
                        No active customers right now.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {session?.user && canForceCheckout(session.user.role) ? (
              <div className="mt-4 border-t border-[var(--line)] pt-4">
                <ForceCheckoutForm />
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reception Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ReceptionShortcuts />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
