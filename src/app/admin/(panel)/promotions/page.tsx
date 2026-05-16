"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Promo = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  startDate: string;
  endDate: string;
};

export default function AdminPromotionsPage() {
  const [items, setItems] = useState<Promo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/promotions");
    if (!res.ok) return;
    const j = (await res.json()) as { items: Promo[] };
    setItems(j.items);
  }

  useEffect(() => { void load(); }, []);

  async function onUploadClick() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      setUploading(true);
      try {
        const fd = new FormData();
        fd.set("file", f);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error();
        const j = (await res.json()) as { url: string };
        setImage(j.url);
      } catch {
        alert("Не удалось загрузить файл");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }

  async function deletePromo(id: string) {
    if (!confirm("Удалить акцию?")) return;
    await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
    await load();
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        image: image || undefined,
        startDate: new Date(start).toISOString(),
        endDate: new Date(end).toISOString(),
      }),
    });
    setSaving(false);
    if (!res.ok) return;
    setTitle(""); setDescription(""); setImage(""); setStart(""); setEnd("");
    await load();
  }

  return (
    <div className="space-y-6">
      {/* Форма создания */}
      <div className="rounded-card bg-white p-6 shadow-card">
        <h1 className="font-heading text-xl font-bold text-primary">Новая акция</h1>
        <form onSubmit={create} className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-neutral-500">Заголовок *</label>
            <input className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-neutral-500">Описание *</label>
            <textarea className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} />
          </div>

          {/* Загрузка фото */}
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-neutral-500">Картинка</label>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onUploadClick}
                disabled={uploading}
                className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
              >
                {uploading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-neutral-900" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 3v10M6 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                )}
                Загрузить файл
              </button>
              {image && (
                <div className="relative h-16 w-28 overflow-hidden rounded-lg border border-neutral-200">
                  <Image src={image} alt="" fill className="object-cover" sizes="112px" />
                  <button type="button" onClick={() => setImage("")} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white text-xs hover:bg-black/80">✕</button>
                </div>
              )}
              {!image && (
                <input
                  className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-mono focus:border-neutral-400 focus:outline-none"
                  placeholder="или вставьте URL"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-500">Начало *</label>
            <input type="datetime-local" className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none" value={start} onChange={(e) => setStart(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500">Окончание *</label>
            <input type="datetime-local" className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none" value={end} onChange={(e) => setEnd(e.target.value)} required />
          </div>

          <div className="md:col-span-2">
            <button className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50" type="submit" disabled={saving}>
              {saving ? "Сохранение…" : "Добавить акцию"}
            </button>
          </div>
        </form>
      </div>

      {/* Список */}
      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-heading text-lg font-bold text-primary">Активные акции ({items.length})</h2>
        {items.length === 0 && <p className="mt-4 text-sm text-neutral-400">Акций пока нет</p>}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {items.map((p) => (
            <div key={p.id} className="flex gap-3 rounded-xl border border-neutral-200 p-3">
              {p.image && (
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  <Image src={p.image} alt="" fill className="object-cover" sizes="80px" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-sm text-primary">{p.title}</div>
                <div className="mt-0.5 text-xs text-neutral-400">
                  {new Date(p.startDate).toLocaleDateString("ru-RU")} — {new Date(p.endDate).toLocaleDateString("ru-RU")}
                </div>
              </div>
              <button onClick={() => deletePromo(p.id)} className="shrink-0 rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Удалить">
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M8 5V3h4v2M6 5l1 12h6l1-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
