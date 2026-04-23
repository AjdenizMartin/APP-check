import { CheckoutForm } from "@/components/visits/checkout-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { getOperationalDashboard } from "@/modules/visits/service";

export const dynamic = "force-dynamic";

export default async function VisitsPage() {
  const data = await getOperationalDashboard();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Customers and Check-out</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.activeVisits.map((visit) => (
            <div key={visit.id} className="rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[var(--foreground)]">{visit.customer.fullName}</p>
                  <p className="text-sm text-[var(--text-muted)]">Check-in: {formatDateTime(visit.checkInAt)}</p>
                </div>
                <Badge>ACTIVE</Badge>
              </div>
              <CheckoutForm visitId={visit.id} />
            </div>
          ))}
          {data.activeVisits.length === 0 ? <p className="text-sm text-[var(--text-muted)]">No active visits.</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
