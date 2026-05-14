type Entry = { fails: number; lockedUntil: number };

const store = new Map<string, Entry>();

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;

export function checkLoginBlocked(key: string): { blocked: boolean; retryAfterSec?: number } {
  const e = store.get(key);
  if (!e) return { blocked: false };
  if (Date.now() < e.lockedUntil) {
    return { blocked: true, retryAfterSec: Math.ceil((e.lockedUntil - Date.now()) / 1000) };
  }
  if (e.fails >= MAX_FAILS) {
    e.fails = 0;
    store.set(key, e);
  }
  return { blocked: false };
}

export function recordLoginFailure(key: string) {
  const now = Date.now();
  const e = store.get(key) ?? { fails: 0, lockedUntil: 0 };
  e.fails += 1;
  if (e.fails >= MAX_FAILS) {
    e.lockedUntil = now + LOCK_MS;
  }
  store.set(key, e);
}

export function clearLoginFailures(key: string) {
  store.delete(key);
}
