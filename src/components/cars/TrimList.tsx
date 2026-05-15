"use client";

import { useCurrency } from "@/lib/currency";

interface Trim {
  id: string;
  name: string;
  price: number;
  optionsJson: string;
}

function parseOptions(json: string): string[] {
  try {
    const t = JSON.parse(json) as unknown;
    return Array.isArray(t) ? t.map(String) : [];
  } catch {
    return [];
  }
}

export function TrimList({ trims }: { trims: Trim[] }) {
  const { fmt } = useCurrency();

  if (trims.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      {trims.map((tr) => (
        <details key={tr.id} className="rounded-card border border-black/10 bg-white p-4 shadow-card">
          <summary className="cursor-pointer font-heading text-lg font-semibold text-primary">
            {tr.name} — {fmt(tr.price)}
          </summary>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-sub">
            {parseOptions(tr.optionsJson).map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
