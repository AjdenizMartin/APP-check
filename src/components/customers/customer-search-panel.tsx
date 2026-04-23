"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckInButton } from "@/components/visits/checkin-button";

interface Customer {
  id: string;
  fullName: string;
  phone: string;
  isActive: boolean;
  hasActiveVisit: boolean;
  activeVisitId: string | null;
}

export function CustomerSearchPanel() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/customers?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.data || []);
        } else {
          const errorText = await response.text();
          console.error("Search API error:", response.status, errorText);
          setError(`Search failed: ${response.status}`);
        }
      } catch (err) {
        console.error("Search failed", err);
        setError("Search failed. Check console for details.");
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search by name, phone or internal code (min 2 chars)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />

      {loading && <p className="text-sm text-[var(--text-muted)]">Searching...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="max-h-96 overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead>
              <tr className="border-b border-[var(--line)] text-[var(--text-muted)]">
                <th className="p-2">Customer</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Visit</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
            {results.map((customer) => (
              <tr key={customer.id} className="border-b border-[var(--line)]/50">
                <td className="p-2 font-medium text-[var(--foreground)]">{customer.fullName}</td>
                <td className="p-2 text-[var(--text-muted)]">{customer.phone}</td>
                <td className="p-2">
                  {customer.hasActiveVisit ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">IN</Badge>
                  ) : (
                    <Badge>OUT</Badge>
                  )}
                </td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/customers?customerId=${customer.id}`)}
                      className="rounded border border-[var(--line)] bg-[var(--surface-muted)] px-2 py-1 text-xs hover:bg-[#193229]"
                    >
                      Open profile
                    </button>
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
            {results.length === 0 && query.length >= 2 && !loading ? (
              <tr>
                <td className="p-4 text-sm text-[var(--text-muted)]" colSpan={4}>
                  No customers found for this query.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
