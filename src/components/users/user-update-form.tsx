"use client";

import { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function UserUpdateForm({
  user,
}: {
  user: {
    id: string;
    role: UserRole;
    isActive: boolean;
  };
}) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const [submitting, setSubmitting] = useState(false);

  const onSave = async () => {
    setSubmitting(true);
    const response = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, isActive }),
    });
    setSubmitting(false);

    if (!response.ok) {
      const data = await response.json();
      alert(data.error ?? "Could not update user");
      return;
    }

    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <select className="h-8 rounded border border-[var(--line)] bg-[var(--surface-muted)] px-2 text-xs text-[var(--foreground)]" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
        <option value={UserRole.ADMIN}>ADMIN</option>
        <option value={UserRole.SUPERVISOR}>SUPERVISOR</option>
        <option value={UserRole.EMPLOYEE}>EMPLOYEE</option>
      </select>
      <label className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        active
      </label>
      <Button size="sm" variant="outline" onClick={onSave} disabled={submitting}>
        {submitting ? "..." : "Save"}
      </Button>
    </div>
  );
}
