"use client";

import { useState } from "react";
import { Search, Clock3, PlusCircle } from "lucide-react";
import { FloatingCard } from "@/components/shared/floating-card";
import { CustomerCreateForm } from "@/components/customers/customer-create-form";
import { CustomerSearchPanel } from "@/components/customers/customer-search-panel";

export function ReceptionShortcuts() {
  const [showCreate, setShowCreate] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <div className="space-y-2 text-sm">
        <button
          onClick={() => setShowSearch(true)}
          className="flex w-full items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3 text-left hover:bg-[#193229]"
        >
          <Search className="h-4 w-4 text-[#e4c79e]" />
          Find customer and check in quickly
        </button>

        <a
          href="/dashboard/visits"
          className="flex w-full items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3 hover:bg-[#193229]"
        >
          <Clock3 className="h-4 w-4 text-[#e4c79e]" />
          Process check-outs from active list
        </a>

        <button
          onClick={() => setShowCreate(true)}
          className="flex w-full items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3 text-left hover:bg-[#193229]"
        >
          <PlusCircle className="h-4 w-4 text-[#e4c79e]" />
          Quick Customer Creation
        </button>
      </div>

      <FloatingCard open={showCreate} onClose={() => setShowCreate(false)} title="Quick Customer Creation">
        <CustomerCreateForm />
      </FloatingCard>

      <FloatingCard open={showSearch} onClose={() => setShowSearch(false)} title="Find Customer">
        <CustomerSearchPanel />
      </FloatingCard>
    </>
  );
}
