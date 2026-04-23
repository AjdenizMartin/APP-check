"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ForceCheckoutForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const confirmA = window.confirm("High-risk action: force check-out for all active visits. Continue?");
    if (!confirmA) return;

    const confirmB = window.confirm("Final confirmation: all active visits will be closed as FORCED_OUT.");
    if (!confirmB) return;

    setSubmitting(true);
    const response = await fetch("/api/visits/force-checkout-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Operator initiated force checkout" }),
    });
    setSubmitting(false);

    if (!response.ok) {
      const data = await response.json();
      alert(data.error ?? "Could not run force check-out");
      return;
    }

    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-lg border border-[#85342f] bg-[rgba(209,96,87,0.12)] p-3">
      <p className="text-sm font-semibold text-[#f0958c]">Global Force Check-out</p>
      <Button type="submit" variant="destructive" size="sm" disabled={submitting}>
        {submitting ? "Running..." : "Force check-out all"}
      </Button>
    </form>
  );
}
