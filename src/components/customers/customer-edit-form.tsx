"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  fullName: z.string().min(3),
  phone: z.string().min(6),
  address: z.string().min(5),
  notes: z.string().optional(),
  internalCode: z.string().optional(),
  reason: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CustomerEditForm({
  customer,
}: {
  customer: {
    id: string;
    fullName: string;
    phone: string;
    address: string;
    notes: string | null;
    internalCode: string | null;
  };
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: customer.fullName,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes ?? "",
      internalCode: customer.internalCode ?? "",
      reason: "",
    },
  });

  // Fix: Reset form when customer changes to prevent stale data
  useEffect(() => {
    reset({
      fullName: customer.fullName,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes ?? "",
      internalCode: customer.internalCode ?? "",
      reason: "",
    });
  }, [customer.id, customer.fullName, customer.phone, customer.address, customer.notes, customer.internalCode, reset]);

  const onSubmit = async (values: FormValues) => {
    const response = await fetch(`/api/customers/${customer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.error ?? "Could not update customer");
      return;
    }

    router.refresh();
  };

  const onDeactivate = async () => {
    const confirmed = window.confirm("Are you sure you want to deactivate this customer?");
    if (!confirmed) return;

    const reason = window.prompt("Optional reason for deactivation (recommended):") ?? "";
    const response = await fetch(`/api/customers/${customer.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.error ?? "Could not deactivate customer");
      return;
    }

    router.push("/dashboard/customers");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-lg border border-[var(--line)] bg-[var(--surface-elevated)] p-4">
      <h4 className="font-semibold text-[var(--foreground)]">Edit Profile</h4>
      <div className="space-y-1">
        <Label htmlFor="edit-fullName">Full name</Label>
        <Input id="edit-fullName" {...register("fullName")} />
        {errors.fullName ? <p className="text-xs text-[#f0958c]">{errors.fullName.message}</p> : null}
      </div>
      <div className="space-y-1">
        <Label htmlFor="edit-phone">Phone</Label>
        <Input id="edit-phone" {...register("phone")} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="edit-address">Address</Label>
        <Input id="edit-address" {...register("address")} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="edit-internalCode">Internal code</Label>
        <Input id="edit-internalCode" {...register("internalCode")} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="edit-notes">Notes</Label>
        <Textarea id="edit-notes" {...register("notes")} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="edit-reason">Change reason (for sensitive edits)</Label>
        <Input id="edit-reason" {...register("reason")} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save changes"}
      </Button>
      <Button type="button" variant="destructive" onClick={onDeactivate}>
        Deactivate customer
      </Button>
    </form>
  );
}
