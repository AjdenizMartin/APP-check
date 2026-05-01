import { VisitResultType } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { calculateVisitNet, formatSignedResult, mapNetToFinancial, parseNonNegativeAmount } from "@/lib/financials/visit-result";

describe("visit result helpers", () => {
  it("normaliza vacios a 0", () => {
    expect(parseNonNegativeAmount("")).toBe(0);
    expect(parseNonNegativeAmount(undefined)).toBe(0);
    expect(parseNonNegativeAmount(null)).toBe(0);
  });

  it("calcula neto y mapea WIN/LOSS/EVEN", () => {
    const winNet = calculateVisitNet(100, 300);
    expect(winNet).toBe(200);
    expect(mapNetToFinancial(winNet)).toEqual({ resultType: VisitResultType.WIN, amount: 200 });

    const lossNet = calculateVisitNet(300, 100);
    expect(lossNet).toBe(-200);
    expect(mapNetToFinancial(lossNet)).toEqual({ resultType: VisitResultType.LOSS, amount: 200 });

    const evenNet = calculateVisitNet(100, 100);
    expect(evenNet).toBe(0);
    expect(mapNetToFinancial(evenNet)).toEqual({ resultType: VisitResultType.EVEN, amount: 0 });
  });

  it("formatea signo correctamente", () => {
    expect(formatSignedResult(200)).toBe("+200.00");
    expect(formatSignedResult(-200)).toBe("-200.00");
    expect(formatSignedResult(0)).toBe("0");
  });
});
