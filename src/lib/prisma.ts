import { PrismaClient } from "@prisma/client";

/** SQLite в Prisma требует `file:`; в Render часто задают путь без префикса или в кавычках. */
function stripOuterQuotes(s: string): string {
  let t = s.trim();
  while (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

function normalizeDatabaseUrlForPrisma() {
  let url = process.env.DATABASE_URL;
  if (url == null || String(url).trim() === "") return;
  url = stripOuterQuotes(String(url));
  const lower = url.toLowerCase();
  if (lower.startsWith("postgresql:") || lower.startsWith("postgres:")) {
    process.env.DATABASE_URL = url;
    return;
  }
  const fileMatch = url.match(/^file:/i);
  if (fileMatch) {
    process.env.DATABASE_URL = "file:" + url.slice(fileMatch[0].length);
    return;
  }
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) {
    const pathPart =
      url.startsWith("./") || url.startsWith("/") ? url : `./${url.replace(/^\.\//, "")}`;
    process.env.DATABASE_URL = `file:${pathPart}`;
    return;
  }
  process.env.DATABASE_URL = url;
}

normalizeDatabaseUrlForPrisma();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
