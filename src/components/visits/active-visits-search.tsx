"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckoutForm } from "@/components/visits/checkout-form";
import { formatDateTime } from "@/lib/format";

interface ActiveVisit {
  id: string;
  fullName: string;
  checkInAt: Date;
}

interface ActiveVisitsSearchProps {
  visits: ActiveVisit[];
}

function matchesInitials(fullName: string, query: string) {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toLowerCase() ?? "")
    .join("");

  return initials.includes(query);
}

export function ActiveVisitsSearch({ visits }: ActiveVisitsSearchProps) {
  const [search, setSearch] = useState("");
  const normalized = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalized) return visits;

    return visits.filter((visit) => {
      const name = visit.fullName.toLowerCase();
      return name.includes(normalized) || matchesInitials(visit.fullName, normalized);
    });
  }, [normalized, visits]);

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search active customer by name or initials (e.g. CV)"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="w-full"
      />
      <div className="space-y-3">
        {filtered.map((visit) => (
          <div key={visit.id} className="rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--foreground)]">{visit.fullName}</p>
                <p className="text-sm text-[var(--text-muted)]">Check-in: {formatDateTime(visit.checkInAt)}</p>
              </div>
              <Badge>ACTIVE</Badge>
            </div>
            <CheckoutForm visitId={visit.id} />
          </div>
        ))}
        {filtered.length === 0 ? <p className="text-sm text-[var(--text-muted)]">No active visits found for this search.</p> : null}
      </div>
    </div>
  );
}
