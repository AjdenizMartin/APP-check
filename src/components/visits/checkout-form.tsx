"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { calculateVisitNet, formatSignedResult } from "@/lib/financials/visit-result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  amountIn: z.number().min(0, "Amount In cannot be negative"),
  amountOut: z.number().min(0, "Amount Out cannot be negative"),
  currency: z.string().length(3),
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
    defaultValues: { amountIn: 0, amountOut: 0, currency: "EUR" },
  });

  const amountIn = watch("amountIn") ?? 0;
  const amountOut = watch("amountOut") ?? 0;
  const netResult = calculateVisitNet(amountIn, amountOut);

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
    <form onSubmit={handleSubmit(onSubmit)} className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[minmax(150px,1fr)_minmax(150px,1fr)_minmax(120px,140px)_110px_auto] sm:items-end">
      <div className="space-y-1 min-w-0">
        <Label className="block">Amount In</Label>
        <Input
          type="number"
          step="0.01"
          min={0}
          className="h-9"
          {...register("amountIn", {
            setValueAs: (value) => (value === "" || value == null ? 0 : Number(value)),
          })}
        />
      </div>
      <div className="space-y-1 min-w-0">
        <Label className="block">Amount Out</Label>
        <Input
          type="number"
          step="0.01"
          min={0}
          className="h-9"
          {...register("amountOut", {
            setValueAs: (value) => (value === "" || value == null ? 0 : Number(value)),
          })}
        />
      </div>
      <div className="space-y-1 min-w-0">
        <Label className="block">Result</Label>
        <Input value={formatSignedResult(netResult)} readOnly className="h-9" />
      </div>
      <div className="space-y-1 min-w-0">
        <Label className="block">Currency</Label>
        <Input className="h-9" {...register("currency")} />
      </div>
      <Button type="submit" size="sm" disabled={isSubmitting} className="h-9 sm:self-end">
        {isSubmitting ? "Closing..." : "Check out"}
      </Button>
      {errors.amountIn ? <p className="text-xs text-[#f0958c] sm:col-span-5">{errors.amountIn.message}</p> : null}
      {errors.amountOut ? <p className="text-xs text-[#f0958c] sm:col-span-5">{errors.amountOut.message}</p> : null}
    </form>
  );
}
