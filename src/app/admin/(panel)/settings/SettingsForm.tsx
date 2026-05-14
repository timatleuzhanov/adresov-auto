"use client";

import type { SiteSettings } from "@prisma/client";
import { useState } from "react";

const fields = [
  "phone",
  "email",
  "address",
  "workHours",
  "mapEmbedUrl",
  "whatsapp",
  "telegramUrl",
  "instagramUrl",
  "siteTitle",
  "siteDescription",
  "slogan",
] as const;

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [values, setValues] = useState({
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    workHours: settings.workHours,
    mapEmbedUrl: settings.mapEmbedUrl ?? "",
    defaultCreditRate: settings.defaultCreditRate,
    whatsapp: settings.whatsapp ?? "",
    telegramUrl: settings.telegramUrl ?? "",
    instagramUrl: settings.instagramUrl ?? "",
    siteTitle: settings.siteTitle ?? "",
    siteDescription: settings.siteDescription ?? "",
    slogan: settings.slogan,
  });
  const [msg, setMsg] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        mapEmbedUrl: values.mapEmbedUrl || null,
        whatsapp: values.whatsapp || null,
        telegramUrl: values.telegramUrl.trim() || null,
        instagramUrl: values.instagramUrl.trim() || null,
        siteTitle: values.siteTitle || null,
        siteDescription: values.siteDescription || null,
      }),
    });
    setMsg(res.ok ? "Сохранено" : "Ошибка");
  }

  return (
    <form onSubmit={save} className="grid max-w-2xl gap-3 text-sm">
      {fields.map((k) => (
        <label key={k} className="block">
          <div className="text-sub">{k}</div>
          {k === "siteDescription" || k === "address" ? (
            <textarea
              className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2"
              value={String(values[k] ?? "")}
              onChange={(e) => setValues({ ...values, [k]: e.target.value })}
              rows={k === "address" ? 2 : 3}
            />
          ) : (
            <input
              className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2"
              value={String(values[k] ?? "")}
              onChange={(e) => setValues({ ...values, [k]: e.target.value })}
            />
          )}
        </label>
      ))}
      <label className="block">
        <div className="text-sub">defaultCreditRate</div>
        <input
          type="number"
          step="0.1"
          className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2"
          value={values.defaultCreditRate}
          onChange={(e) => setValues({ ...values, defaultCreditRate: Number(e.target.value) })}
        />
      </label>
      <button type="submit" className="mt-2 w-fit rounded-btn bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800">
        Сохранить
      </button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
