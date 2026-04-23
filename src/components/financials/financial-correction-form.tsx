"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { VisitResultType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z
  .object({
    resultType: z.nativeEnum(VisitResultType),
    amount: z.number().min(0),
    currency: z.string().length(3),
    reason: z.string().min(5),
  })
  .superRefine((data, ctx) => {
    if (data.resultType === VisitResultType.EVEN && data.amount !== 0) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: "EVEN requires amount=0" });
    }
  });

type FormValues = z.infer<typeof schema>;

export function FinancialCorrectionForm({
  visitId,
  defaults,
}: {
  visitId: string;
  defaults: {
    resultType: VisitResultType;
    amount: number;
    currency: string;
  };
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      resultType: defaults.resultType,
      amount: defaults.amount,
      currency: defaults.currency,
      reason: "",
    },
  });

  const resultType = watch("resultType");

  const onSubmit = async (values: FormValues) => {
    const response = await fetch("/api/visits/financials/correct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitId,
        resultType: values.resultType,
        amount: values.amount,
        currency: values.currency,
        reason: values.reason,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.error ?? "Could not correct financial entry");
      return;
    }

    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 grid grid-cols-1 gap-2 rounded border border-[#8d6735] bg-[rgba(181,138,82,0.12)] p-2 md:grid-cols-5">
      <select className="h-9 rounded border border-[var(--line)] bg-[var(--surface-muted)] px-2 text-xs" {...register("resultType")}>
        <option value={VisitResultType.EVEN}>EVEN</option>
        <option value={VisitResultType.WIN}>WIN</option>
        <option value={VisitResultType.LOSS}>LOSS</option>
      </select>
      <Input
        type="number"
        step="0.01"
        className="h-9 text-xs"
        disabled={resultType === VisitResultType.EVEN}
        {...register("amount", { valueAsNumber: true })}
      />
      <Input className="h-9 text-xs" {...register("currency")} />
      <Input className="h-9 text-xs" placeholder="Mandatory reason" {...register("reason")} />
      <Button type="submit" size="sm" className="h-9" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Apply correction"}
      </Button>
      {errors.amount ? <p className="text-xs text-[#f0958c] md:col-span-5">{errors.amount.message}</p> : null}
      {errors.reason ? <p className="text-xs text-[#f0958c] md:col-span-5">{errors.reason.message}</p> : null}
    </form>
  );
}
