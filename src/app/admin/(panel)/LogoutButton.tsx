"use client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="w-full rounded-btn border border-black/10 px-2 py-2 text-sm hover:bg-muted"
      onClick={async () => {
        await fetch("/api/admin/auth/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
    >
      Выйти
    </button>
  );
}
