/** Аннуитет: M = P × [r(1+r)^n] / [(1+r)^n − 1] */
export function annuityMonthlyPayment(
  principal: number,
  annualRatePercent: number,
  months: number
): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal / months;
  const pow = Math.pow(1 + r, months);
  return (principal * (r * pow)) / (pow - 1);
}
