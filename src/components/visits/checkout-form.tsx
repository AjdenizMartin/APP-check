"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { VisitResultType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const resultTypeSchema = z.union([z.literal(VisitResultType.WIN), z.literal(VisitResultType.LOSS)]);

const schema = z.object({
  resultType: resultTypeSchema,
  amount: z.number().min(0),
  currency: z.string().length(3),
});

type FormValues = z.infer<typeof schema>;

export function CheckoutForm({ visitId }: { visitId: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { resultType: VisitResultType.WIN, amount: 0, currency: "EUR" },
  });

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
    <form onSubmit={handleSubmit(onSubmit)} className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[minmax(130px,160px)_minmax(170px,1fr)_110px_auto] sm:items-end">
      <div className="space-y-1 min-w-0">
        <Label className="block">Result</Label>
        <select className="h-9 w-full rounded-md border border-[var(--line)] bg-[var(--surface-muted)] px-2 text-sm text-[var(--foreground)]" {...register("resultType")}>
          <option value={VisitResultType.WIN}>WIN</option>
          <option value={VisitResultType.LOSS}>LOSS</option>
        </select>
      </div>
      <div className="space-y-1 min-w-0">
        <Label className="block">Amount</Label>
        <Input type="number" step="0.01" className="h-9" {...register("amount", { valueAsNumber: true })} />
      </div>
      <div className="space-y-1 min-w-0">
        <Label className="block">Currency</Label>
        <Input className="h-9" {...register("currency")} />
      </div>
      <Button type="submit" size="sm" disabled={isSubmitting} className="h-9 sm:self-end">
        {isSubmitting ? "Closing..." : "Check out"}
      </Button>
      {errors.amount ? <p className="text-xs text-[#f0958c] sm:col-span-4">{errors.amount.message}</p> : null}
    </form>
  );
}
