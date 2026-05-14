"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lead, LeadStatus, Car } from "@prisma/client";

type LeadRow = Lead & {
  car: Pick<Car, "brand" | "model" | "year" | "slug"> | null;
};

export default function AdminLeadsPage() {
  const [data, setData] = useState<{ leads: LeadRow[]; newToday: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    const res = await fetch("/api/admin/leads");
    if (!res.ok) {
      setError("Нет доступа");
      return;
    }
    setData(await res.json());
  }

  useEffect(() => {
    void load();
  }, []);

  const statusValues = useMemo(() => ["NEW", "IN_PROGRESS", "DONE", "CANCELLED"] as LeadStatus[], []);

  async function patch(id: string, patch: { status?: LeadStatus; comment?: string }) {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return;
    await load();
  }

  if (error) return <div className="rounded-card bg-white p-6 text-sm text-red-600 shadow-card">{error}</div>;
  if (!data) return <div className="rounded-card bg-white p-6 shadow-card">Загрузка…</div>;

  return (
    <div className="rounded-card bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-primary">Заявки</h1>
        <div className="text-sm text-sub">Новых за сегодня: {data.newToday}</div>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs text-sub">
            <tr>
              <th className="py-2">Дата</th>
              <th className="py-2">Тип</th>
              <th className="py-2">Клиент</th>
              <th className="py-2">Авто</th>
              <th className="py-2">Статус</th>
              <th className="py-2">Комментарий</th>
            </tr>
          </thead>
          <tbody>
            {data.leads.map((l) => (
              <tr key={l.id} className="border-t border-black/10 align-top">
                <td className="py-3 text-xs text-sub">{new Date(l.createdAt).toLocaleString("ru-RU")}</td>
                <td className="py-3 text-xs">{l.type}</td>
                <td className="py-3">
                  <div className="font-semibold">{l.name}</div>
                  <div className="text-xs text-sub">{l.phone}</div>
                </td>
                <td className="py-3 text-xs text-sub">
                  {l.car ? (
                    <a className="text-primary hover:underline" href={`/catalog/${l.car.slug}`}>
                      {l.car.brand} {l.car.model}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-3">
                  <select
                    className="w-44 rounded-btn border border-black/10 px-2 py-1 text-xs"
                    value={l.status}
                    onChange={(e) => void patch(l.id, { status: e.target.value as LeadStatus })}
                  >
                    {statusValues.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3">
                  <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const text = String(fd.get("comment") || "").trim();
                      if (!text) return;
                      void patch(l.id, { comment: text });
                      e.currentTarget.reset();
                    }}
                  >
                    <input name="comment" className="w-40 rounded-btn border border-black/10 px-2 py-1 text-xs" placeholder="Комментарий" />
                    <button className="rounded-btn bg-primary px-2 py-1 text-xs font-semibold text-white" type="submit">
                      OK
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
