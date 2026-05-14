/** Частая ошибка в Dashboard: в значение копируют имя ключа вместо URL. */
const PLACEHOLDER_VALUES = new Set(["NEXT_PUBLIC_SITE_URL", "${NEXT_PUBLIC_SITE_URL}"]);

function tryParseHttpOrigin(raw: string | undefined): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s || PLACEHOLDER_VALUES.has(s)) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.origin;
  } catch {
    return null;
  }
}

/**
 * Публичный origin сайта (metadata, sitemap, robots).
 * На Render при неверном NEXT_PUBLIC_SITE_URL можно опереться на RENDER_EXTERNAL_URL.
 */
export function getPublicSiteOrigin(): string {
  return (
    tryParseHttpOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    tryParseHttpOrigin(process.env.RENDER_EXTERNAL_URL) ??
    "http://localhost:3000"
  );
}

export function getPublicSiteUrl(): URL {
  return new URL(getPublicSiteOrigin());
}
