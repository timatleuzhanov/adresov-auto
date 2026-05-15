"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteCarButton({ carId, carName }: { carId: string; carName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/admin/cars/${carId}`, { method: "DELETE" });
    router.refresh();
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1">
        <button
          type="button"
          disabled={loading}
          onClick={handleDelete}
          className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "…" : "Удалить"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-50"
        >
          Отмена
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      title={`Удалить ${carName}`}
      className="rounded p-1.5 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M3 5h14M8 5V3h4v2M6 5l1 12h6l1-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
