"use client";

import { useEffect, useState } from "react";

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

  async function load() {
    const res = await fetch("/api/admin/promotions");
    if (!res.ok) return;
    const j = (await res.json()) as {
      items: Array<{
        id: string;
        title: string;
        description: string;
        image: string | null;
        startDate: string;
        endDate: string;
      }>;
    };
    setItems(
      j.items.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        image: p.image,
        startDate: p.startDate,
        endDate: p.endDate,
      }))
    );
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
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
    if (!res.ok) return;
    setTitle("");
    setDescription("");
    setImage("");
    setStart("");
    setEnd("");
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-card bg-white p-6 shadow-card">
        <h1 className="font-heading text-2xl font-bold text-primary">Акции</h1>
        <form onSubmit={create} className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm text-sub">Заголовок</label>
            <input className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-sub">Описание</label>
            <textarea className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-sub">Картинка URL</label>
            <input className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" value={image} onChange={(e) => setImage(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-sub">Начало</label>
            <input type="datetime-local" className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" value={start} onChange={(e) => setStart(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-sub">Окончание</label>
            <input type="datetime-local" className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" value={end} onChange={(e) => setEnd(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <button className="rounded-btn bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800" type="submit">
              Добавить акцию
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-heading text-lg font-bold text-primary">Список</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((p) => (
            <li key={p.id} className="rounded-btn border border-black/10 p-3">
              <div className="font-semibold">{p.title}</div>
              <div className="text-xs text-sub">
                {new Date(p.startDate).toLocaleString("ru-RU")} — {new Date(p.endDate).toLocaleString("ru-RU")}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
