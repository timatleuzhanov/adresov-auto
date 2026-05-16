"use client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-neutral-400 hover:bg-red-50 hover:text-red-600 transition-colors"
      onClick={async () => {
        await fetch("/api/admin/auth/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
    >
      <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
        <path d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3M13 14l3-4-3-4M16 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Выйти
    </button>
  );
}
