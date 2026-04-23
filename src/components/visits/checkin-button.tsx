"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CheckInButton({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const response = await fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId }),
    });
    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      alert(data.error ?? "Could not complete check-in");
      return;
    }

    router.refresh();
  };

  return (
    <Button size="sm" onClick={handleClick} disabled={loading}>
      {loading ? "Processing..." : "Check in"}
    </Button>
  );
}
