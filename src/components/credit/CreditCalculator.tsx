"use client";

import { useMemo, useState } from "react";
import { annuityMonthlyPayment } from "@/lib/credit";

const TERMS = [12, 24, 36, 48, 60, 72, 84];

export function CreditCalculator({
  defaultRate,
  initialPrice,
  onOpenCreditForm,
}: {
  defaultRate: number;
  initialPrice?: number;
  onOpenCreditForm?: () => void;
}) {
  const [price, setPrice] = useState(initialPrice ?? 15_000_000);
  const [down, setDown] = useState(1_500_000);
  const [downPct, setDownPct] = useState(false);
  const [months, setMonths] = useState(60);
  const [rate, setRate] = useState(defaultRate);

  const principal = useMemo(() => {
    const d = downPct ? Math.round((price * down) / 100) : down;
    return Math.max(0, price - d);
  }, [price, down, downPct]);

  const monthly = useMemo(() => annuityMonthlyPayment(principal, rate, months), [principal, rate, months]);
  const totalPay = monthly * months;
  const overpay = totalPay - principal;

  return (
    <div className="grid gap-6 rounded-card border border-neutral-200 bg-white p-6 shadow-card md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label className="text-sm text-sub">Стоимость автомобиля, ₸</label>
          <input
            type="number"
            className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2"
            value={price}
            min={0}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-sm text-sub">Первоначальный взнос</label>
          <div className="mt-1 flex gap-2">
            <input
              type="number"
              className="w-full rounded-btn border border-black/10 px-3 py-2"
              value={down}
              min={0}
              onChange={(e) => setDown(Number(e.target.value))}
            />
            <button
              type="button"
              className={`rounded-btn border px-3 text-sm ${downPct ? "border-primary bg-primary text-white" : "border-black/10"}`}
              onClick={() => setDownPct((v) => !v)}
            >
              %
            </button>
          </div>
          <p className="mt-1 text-xs text-sub">{downPct ? "Взнос в процентах от цены" : "Взнос суммой"}</p>
        </div>
        <div>
          <label className="text-sm text-sub">Срок кредита: {months} мес.</label>
          <input
            type="range"
            min={0}
            max={TERMS.length - 1}
            value={TERMS.indexOf(months)}
            onChange={(e) => setMonths(TERMS[Number(e.target.value)] ?? 60)}
            className="mt-2 w-full"
          />
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-sub">
            {TERMS.map((t) => (
              <button
                key={t}
                type="button"
                className={`rounded-btn border px-2 py-1 ${months === t ? "border-primary text-primary" : "border-black/10"}`}
                onClick={() => setMonths(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm text-sub">Ставка, % годовых</label>
          <input
            type="number"
            step="0.1"
            className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="flex flex-col justify-between rounded-card border border-neutral-800 bg-neutral-900 p-5 text-logo">
        <div className="space-y-2">
          <div className="text-sm text-logo/70">Ежемесячный платёж</div>
          <div className="font-heading text-3xl font-bold text-logo-bright">{Math.round(monthly).toLocaleString("ru-RU")} ₸</div>
          <div className="text-sm text-logo/70">Сумма кредита: {principal.toLocaleString("ru-RU")} ₸</div>
          <div className="text-sm text-logo/70">Всего выплат: {Math.round(totalPay).toLocaleString("ru-RU")} ₸</div>
          <div className="text-sm text-logo/70">Переплата: {Math.max(0, Math.round(overpay)).toLocaleString("ru-RU")} ₸</div>
        </div>
        <button
          type="button"
          onClick={onOpenCreditForm}
          className="mt-6 rounded-btn border border-logo bg-logo px-4 py-3 text-center text-sm font-semibold text-black hover:bg-logo-bright"
        >
          Оформить заявку на кредит
        </button>
      </div>
    </div>
  );
}
