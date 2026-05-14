import { Suspense } from "react";
import { AdminLoginInner } from "./AdminLoginInner";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-sub">Загрузка…</div>}>
      <AdminLoginInner />
    </Suspense>
  );
}
