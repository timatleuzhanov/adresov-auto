"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AdminLoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin/dashboard";
  const [email, setEmail] = useState("admin@adresov.kz");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string; retryAfter?: number };
      setError(j.retryAfter ? `Попробуйте через ${j.retryAfter} с` : j.error || "Ошибка входа");
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="rounded-modal bg-white p-8 shadow-card">
        <h1 className="font-heading text-2xl font-bold text-primary">Вход в админку</h1>
        <p className="mt-2 text-sm text-sub">ADRESOV AUTO /admin</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-sub">Email</label>
            <input className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-sub">Пароль</label>
            <input
              type="password"
              className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="w-full rounded-btn bg-neutral-900 py-2 text-sm font-semibold text-white hover:bg-neutral-800">
            Войти
          </button>
        </form>
        <p className="mt-4 text-xs text-sub">Тестовый вход: admin@adresov.kz / пароль из .env (по умолчанию Admin123!)</p>
      </div>
    </div>
  );
}
