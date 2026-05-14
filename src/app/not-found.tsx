import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-sm font-semibold text-neutral-500">404</p>
      <h1 className="mt-3 font-heading text-3xl font-bold text-primary">Страница не найдена</h1>
      <p className="mt-3 text-sub">Проверьте адрес или вернитесь на главную.</p>
      <Link href="/" className="mt-8 inline-block rounded-btn bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800">
        На главную
      </Link>
    </div>
  );
}
