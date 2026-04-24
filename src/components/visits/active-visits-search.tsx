"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutForm } from "@/components/visits/checkout-form";
import { formatTime } from "@/lib/format";

interface ActiveVisit {
  id: string;
  fullName: string;
  checkInAt: Date;
  checkInBy: { name: string };
}

interface ActiveVisitsSearchProps {
  visits: ActiveVisit[];
}

export function ActiveVisitsSearch({ visits }: ActiveVisitsSearchProps) {
  const [search, setSearch] = useState("");

  const filtered = visits.filter(v => 
    v.fullName.toLowerCase().includes(search.toLowerCase()) ||
    v.checkInBy.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base">Search for Check-out</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="Search by customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 w-full"
        />
        <div className="space-y-2">
          {filtered.map((visit) => (
            <div key={visit.id} className="rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[var(--foreground)]">{visit.fullName}</p>
                  <p className="text-sm text-[var(--text-muted)]">Check-in: {formatTime(visit.checkInAt)}</p>
                </div>
                <Badge>ACTIVE</Badge>
              </div>
              <CheckoutForm visitId={visit.id} />
            </div>
          ))}
          {filtered.length === 0 && search.length >= 2 ? (
            <p className="text-sm text-[var(--text-muted)]">No active visits found for your search.</p>
          ) : null}
          {visits.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No active visits right now.</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
