"use client";

import { useState } from "react";
import { Search, Clock3 } from "lucide-react";
import { FloatingCard } from "@/components/shared/floating-card";
import { CustomerCreateForm } from "@/components/customers/customer-create-form";
import { CustomerSearchPanel } from "@/components/customers/customer-search-panel";

export function DashboardClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="space-y-5">
      {children}

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-3 text-sm hover:bg-[#193229]"
            >
              <Search className="h-4 w-4 text-[#e4c79e]" />
              Find customer and check in quickly
            </button>
            <a
              href="/dashboard/visits"
              className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-3 text-sm hover:bg-[#193229]"
            >
              <Clock3 className="h-4 w-4 text-[#e4c79e]" />
              Process check-outs from active list
            </a>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <button
            onClick={() => setShowCreate(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-3 hover:bg-[#193229]"
          >
            <Search className="h-4 w-4 text-[#e4c79e]" />
            Quick Customer Creation
          </button>
        </div>
      </section>

      <FloatingCard open={showCreate} onClose={() => setShowCreate(false)} title="Quick Customer Creation">
        <CustomerCreateForm />
      </FloatingCard>

      <FloatingCard open={showSearch} onClose={() => setShowSearch(false)} title="Find Customer">
        <CustomerSearchPanel />
      </FloatingCard>
    </div>
  );
}
