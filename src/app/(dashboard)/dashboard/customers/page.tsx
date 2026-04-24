import { auth } from "@/auth";
import { CustomerProfileFloating } from "@/components/customers/customer-profile-floating";
import { CustomerCreateForm } from "@/components/customers/customer-create-form";
import { CheckInButton } from "@/components/visits/checkin-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { searchCustomers, getCustomerDetail, getCustomersCount } from "@/modules/customers/service";

type SearchParams = Promise<{ q?: string; customerId?: string }>;

export const dynamic = "force-dynamic";

export default async function CustomersPage({ searchParams }: { searchParams: SearchParams }) {
  await auth();

  const { q, customerId } = await searchParams;
  const customers = await searchCustomers({ q });
  const selected = customerId ? await getCustomerDetail(customerId) : null;
  const totalCustomers = await getCustomersCount();

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <CustomerCreateForm />
        <Card id="global-search-section">
          <CardHeader>
            <CardTitle>Global Customer Search</CardTitle>
            <form className="mt-2" action="/dashboard/customers" method="get">
              <input
                defaultValue={q ?? ""}
                name="q"
                placeholder="Search by name, phone or internal code"
                className="h-10 w-full rounded-md border border-[var(--line)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)]"
                id="global-search-input"
              />
            </form>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--text-muted)]">
                    <th className="p-2">Name</th>
                    <th className="p-2">Phone</th>
                    <th className="p-2">Code</th>
                    <th className="p-2">Visit</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-[var(--line)]/50">
                      <td className="p-2 font-medium">{customer.fullName}</td>
                      <td className="p-2">{customer.phone}</td>
                      <td className="p-2">{customer.internalCode ?? "-"}</td>
                      <td className="p-2">
                        {customer.hasActiveVisit ? <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">IN</Badge> : <Badge>OUT</Badge>}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/dashboard/customers?q=${encodeURIComponent(q ?? "")}&customerId=${customer.id}`}
                            className="rounded border border-[var(--line)] bg-[var(--surface-muted)] px-2 py-1 text-xs hover:bg-[#193229]"
                          >
                            Open profile
                          </a>
                          {customer.hasActiveVisit ? (
                            <a
                              href="/dashboard/visits"
                              className="rounded border border-[var(--line)] bg-[var(--surface-muted)] px-2 py-1 text-xs hover:bg-[#193229]"
                            >
                              Check out
                            </a>
                          ) : (
                            <CheckInButton customerId={customer.id} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 ? (
                    <tr>
                      <td className="p-4 text-sm text-[var(--text-muted)]" colSpan={5}>
                        No customers found for this query.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="sticky top-24 h-fit space-y-4">
        {/* Total Customers Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-[var(--foreground)]">{totalCustomers}</p>
            <p className="text-sm text-[var(--text-muted)]">Total registered customers</p>
            <a
              href="#global-search-section"
              className="mt-3 block w-full rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-2 text-center text-sm hover:bg-[#193229]"
            >
              Go to Customer Search
            </a>
          </CardContent>
        </Card>

        {selected ? (
          <CustomerProfileFloating
            customerId={selected.id}
            fullName={selected.fullName}
            phone={selected.phone}
            address={selected.address}
            notes={selected.notes}
            internalCode={selected.internalCode}
            assets={selected.assets.map((asset) => ({
              id: asset.id,
              assetType: asset.assetType,
            }))}
            visits={selected.visits.map((visit) => ({
              id: visit.id,
              status: visit.status,
              checkInAt: visit.checkInAt,
              checkOutAt: visit.checkOutAt,
            }))}
          />
        ) : (
          <Card>
            <CardContent className="p-4 text-sm text-[var(--text-muted)]">
              Select a customer from the table to open the profile panel.
            </CardContent>
          </Card>
        )}
      </aside>
    </div>
  );
}
