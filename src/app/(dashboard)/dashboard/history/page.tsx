import { VisitStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FinancialCorrectionForm } from "@/components/financials/financial-correction-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { canCorrectFinancial } from "@/lib/permissions/roles";
import { getVisitHistory } from "@/modules/visits/service";

type SearchParams = Promise<{ date?: string; status?: VisitStatus; customer?: string; employeeId?: string }>;

export const dynamic = "force-dynamic";

export default async function HistoryPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { date, status, customer, employeeId } = await searchParams;
  const visits = await getVisitHistory({
    date: date ? new Date(date) : new Date(),
    status,
    customerQuery: customer,
    employeeId,
  });

  const allowFinancialCorrection = canCorrectFinancial(session.user.role);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily History</CardTitle>
        <form className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-4" method="get">
          <input
            type="date"
            name="date"
            defaultValue={date ?? new Date().toISOString().slice(0, 10)}
            className="h-10 rounded-md border border-[var(--line)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--foreground)]"
          />
          <select name="status" defaultValue={status ?? ""} className="h-10 rounded-md border border-[var(--line)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--foreground)]">
            <option value="">All statuses</option>
            <option value={VisitStatus.ACTIVE}>ACTIVE</option>
            <option value={VisitStatus.CHECKED_OUT}>CHECKED_OUT</option>
            <option value={VisitStatus.FORCED_OUT}>FORCED_OUT</option>
          </select>
          <input
            name="customer"
            defaultValue={customer ?? ""}
            placeholder="Customer name / phone / code"
            className="h-10 rounded-md border border-[var(--line)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--foreground)]"
          />
          <button className="h-10 rounded-md border border-[#8d6735] bg-[var(--accent)] px-4 text-sm font-medium text-[#1d1306] hover:bg-[var(--accent-strong)]">Apply filters</button>
        </form>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--text-muted)]">
                <th className="p-2">Customer</th>
                <th className="p-2">Check-in</th>
                <th className="p-2">Check-out</th>
                <th className="p-2">Status</th>
                <th className="p-2">Financial</th>
                <th className="p-2">Employee</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit.id} className="border-b border-[var(--line)]/50 align-top">
                  <td className="p-2 font-medium">{visit.customer.fullName}</td>
                  <td className="p-2">{formatDateTime(visit.checkInAt)}</td>
                  <td className="p-2">{formatDateTime(visit.checkOutAt)}</td>
                  <td className="p-2">{visit.status}</td>
                  <td className="p-2">
                    {visit.financial ? (
                      <>
                        <div className="text-xs">
                          {visit.financial.resultType} {formatCurrency(Number(visit.financial.amount), visit.financial.currency)}
                          {visit.financial.status === "CORRECTED" ? " (CORRECTED)" : ""}
                        </div>
                        {allowFinancialCorrection ? (
                          <FinancialCorrectionForm
                            visitId={visit.id}
                            defaults={{
                              resultType: visit.financial.resultType,
                              amount: Number(visit.financial.amount),
                              currency: visit.financial.currency,
                            }}
                          />
                        ) : null}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-2">{visit.checkInBy.name}</td>
                </tr>
              ))}
              {visits.length === 0 ? (
                <tr>
                  <td className="p-4 text-sm text-[var(--text-muted)]" colSpan={6}>
                    No visits found for selected filters.
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
