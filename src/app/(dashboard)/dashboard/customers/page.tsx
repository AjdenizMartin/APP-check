import Link from "next/link";
import { auth } from "@/auth";
import { CustomerAssetUploadForm } from "@/components/customers/customer-asset-upload-form";
import { CustomerCreateForm } from "@/components/customers/customer-create-form";
import { CustomerEditForm } from "@/components/customers/customer-edit-form";
import { CheckInButton } from "@/components/visits/checkin-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { searchCustomers, getCustomerDetail } from "@/modules/customers/service";

type SearchParams = Promise<{ q?: string; customerId?: string }>;

export const dynamic = "force-dynamic";

export default async function CustomersPage({ searchParams }: { searchParams: SearchParams }) {
  await auth();

  const { q, customerId } = await searchParams;
  const customers = await searchCustomers({ q });
  const selected = customerId ? await getCustomerDetail(customerId) : null;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <CustomerCreateForm />
        <Card>
          <CardHeader>
            <CardTitle>Global Customer Search</CardTitle>
            <form className="mt-2" action="/dashboard/customers" method="get">
              <input
                defaultValue={q ?? ""}
                name="q"
                placeholder="Search by name, phone or internal code"
                className="h-10 w-full rounded-md border border-[var(--line)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)]"
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
                          <Link
                            href={`/dashboard/customers?q=${encodeURIComponent(q ?? "")}&customerId=${customer.id}`}
                            className="rounded border border-[var(--line)] bg-[var(--surface-muted)] px-2 py-1 text-xs hover:bg-[#193229]"
                          >
                            Open profile
                          </Link>
                          {customer.hasActiveVisit ? (
                            <Link
                              href="/dashboard/visits"
                              className="rounded border border-[var(--line)] bg-[var(--surface-muted)] px-2 py-1 text-xs hover:bg-[#193229]"
                            >
                              Check out
                            </Link>
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

      <aside className="sticky top-24 h-fit">
        {selected ? (
          <Card className="shadow-xl shadow-[0_24px_44px_-34px_rgba(0,0,0,0.85)]">
            <CardHeader>
              <CardTitle>Customer Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-3">
                <p className="text-lg font-semibold">{selected.fullName}</p>
                <p className="text-sm text-[var(--text-muted)]">{selected.phone}</p>
                <p className="text-sm text-[var(--text-muted)]">{selected.address}</p>
              </div>

              <CustomerEditForm
                customer={{
                  id: selected.id,
                  fullName: selected.fullName,
                  phone: selected.phone,
                  address: selected.address,
                  notes: selected.notes,
                  internalCode: selected.internalCode,
                }}
              />
              <CustomerAssetUploadForm customerId={selected.id} />

              <div className="space-y-2">
                <h4 className="font-semibold text-[var(--foreground)]">Active Photos</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selected.assets.map((asset) => (
                    <div key={asset.id} className="rounded border border-[var(--line)] bg-[var(--surface-muted)] p-2">
                      <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">{asset.assetType}</p>
                      <img src={`/api/customer-assets/${asset.id}/view`} alt={asset.assetType} className="h-24 w-full rounded object-cover" />
                    </div>
                  ))}
                  {selected.assets.length === 0 ? (
                    <p className="col-span-2 text-xs text-[var(--text-muted)]">No active photos uploaded yet.</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-[var(--foreground)]">Recent Visits</h4>
                <ul className="space-y-2 text-sm">
                  {selected.visits.map((visit) => (
                    <li key={visit.id} className="rounded border border-[var(--line)] bg-[var(--surface-muted)] p-2">
                      <p className="font-medium">{visit.status}</p>
                      <p>Check-in: {formatDateTime(visit.checkInAt)}</p>
                      <p>Check-out: {formatDateTime(visit.checkOutAt)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
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
