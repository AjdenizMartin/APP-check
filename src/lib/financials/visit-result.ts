import { VisitResultType } from "@prisma/client";

export function parseNonNegativeAmount(value: unknown): number {
  if (value === "" || value === null || typeof value === "undefined") {
    return 0;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    throw new Error("invalid_amount_format");
  }
  if (parsed < 0) {
    throw new Error("amount_must_be_non_negative");
  }

  return parsed;
}

export function calculateVisitNet(amountIn: number, amountOut: number): number {
  return amountOut - amountIn;
}

export function mapNetToFinancial(net: number): { resultType: VisitResultType; amount: number } {
  if (net > 0) return { resultType: VisitResultType.WIN, amount: net };
  if (net < 0) return { resultType: VisitResultType.LOSS, amount: Math.abs(net) };
  return { resultType: VisitResultType.EVEN, amount: 0 };
}

export function formatSignedResult(value: number): string {
  if (value > 0) return `+${value.toFixed(2)}`;
  if (value < 0) return `-${Math.abs(value).toFixed(2)}`;
  return "0";
}
