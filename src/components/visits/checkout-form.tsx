"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { VisitResultType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    resultType: z.nativeEnum(VisitResultType),
    amount: z.number().min(0),
    currency: z.string().length(3),
  })
  .superRefine((data, ctx) => {
    if (data.resultType === VisitResultType.EVEN && data.amount !== 0) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: "If result is EVEN, amount must be 0" });
    }
  });

type FormValues = z.infer<typeof schema>;

export function CheckoutForm({ visitId }: { visitId: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { resultType: VisitResultType.EVEN, amount: 0, currency: "EUR" },
  });

  const resultType = watch("resultType");

  const onSubmit = async (values: FormValues) => {
    const response = await fetch("/api/visits/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, visitId }),
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.error ?? "Could not complete check-out");
      return;
    }

    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-2">
      <div className="space-y-1">
        <Label>Result</Label>
        <select className="h-9 rounded-md border border-[var(--line)] bg-[var(--surface-muted)] px-2 text-sm text-[var(--foreground)]" {...register("resultType")}>
          <option value={VisitResultType.EVEN}>EVEN</option>
          <option value={VisitResultType.WIN}>WIN</option>
          <option value={VisitResultType.LOSS}>LOSS</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label>Amount</Label>
        <Input
          type="number"
          step="0.01"
          className="h-9"
          disabled={resultType === VisitResultType.EVEN}
          {...register("amount", { valueAsNumber: true })}
        />
      </div>
      <div className="space-y-1">
        <Label>Currency</Label>
        <Input className="h-9 w-20" {...register("currency")} />
      </div>
      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Closing..." : "Check out"}
      </Button>
      {errors.amount ? <p className="w-full text-xs text-[#f0958c]">{errors.amount.message}</p> : null}
    </form>
  );
}
