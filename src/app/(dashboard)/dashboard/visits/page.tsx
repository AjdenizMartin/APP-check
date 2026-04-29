import { ActiveVisitsSearch } from "@/components/visits/active-visits-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOperationalDashboard } from "@/modules/visits/service";

export const dynamic = "force-dynamic";

export default async function VisitsPage() {
  const data = await getOperationalDashboard();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Customers and Quick Check-out</CardTitle>
      </CardHeader>
      <CardContent>
        {data.activeVisits.length > 0 ? (
          <ActiveVisitsSearch
            visits={data.activeVisits.map((visit) => ({
              id: visit.id,
              fullName: visit.customer.fullName,
              checkInAt: visit.checkInAt,
            }))}
          />
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No active visits.</p>
        )}
      </CardContent>
    </Card>
  );
}
