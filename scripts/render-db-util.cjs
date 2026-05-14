const fs = require("fs");
const path = require("path");

function stripOuterQuotes(s) {
  let t = String(s).trim();
  while (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

function isPostgresUrl(url) {
  const u = String(url).trim().toLowerCase();
  return u.startsWith("postgresql:") || u.startsWith("postgres:");
}

function isSqliteFileUrl(url) {
  return String(url).trim().toLowerCase().startsWith("file:");
}

/** Абсолютный путь к файлу БД из SQLite connection string. */
function sqlitePathFromFileUrl(databaseUrl) {
  const u = String(databaseUrl).trim();
  if (!/^file:/i.test(u)) return null;
  let rest = u.slice("file:".length);
  if (rest.startsWith("//")) {
    rest = "/" + rest.slice(2).replace(/^\/+/, "");
  }
  if (rest.startsWith("./") || (!rest.startsWith("/") && !rest.startsWith("\\\\") && rest.length > 0)) {
    if (/^[a-zA-Z]:/.test(rest)) {
      return path.normalize(rest);
    }
    if (!rest.startsWith("/")) {
      return path.resolve(process.cwd(), rest.replace(/^\.\//, ""));
    }
  }
  if (rest.startsWith("/")) {
    return path.normalize(rest);
  }
  return null;
}

/** Типичные mount points постоянного диска Render. */
function sqliteUrlOnRenderPersistentDisk(databaseUrl) {
  const fsPath = sqlitePathFromFileUrl(databaseUrl);
  if (!fsPath) return false;
  const n = path.normalize(fsPath);
  return n === "/var/data" || n.startsWith("/var/data/") || n.startsWith("/mnt/");
}

function assertSqliteUrlNotDirectory(databaseUrl) {
  const fsPath = sqlitePathFromFileUrl(databaseUrl);
  if (!fsPath) return;
  try {
    if (fs.existsSync(fsPath) && fs.statSync(fsPath).isDirectory()) {
      console.error(
        `[render-db] ${databaseUrl} указывает на каталог. Задайте путь к файлу базы, например file:/var/data/adresov.db`
      );
      process.exit(1);
    }
  } catch (_) {
    /* ignore */
  }
}

/**
 * Prisma SQLite требует префикс `file:`. На Render часто забывают DATABASE_URL
 * или вставляют postgres-URL с другим регистром схемы.
 */
function resolveDatabaseUrlForPrisma() {
  let url = process.env.DATABASE_URL;
  if (url != null && url !== "") {
    url = stripOuterQuotes(url);
  }
  if (url == null || String(url).trim() === "") {
    if (process.env.RENDER === "true") {
      console.error(
        "[render-db] DATABASE_URL не задана. В Dashboard Render → Environment задайте URL PostgreSQL (Internal Database URL, обычно postgresql://...) или для SQLite строку вида file:./prisma/data.db"
      );
      process.exit(1);
    }
    process.env.DATABASE_URL = "file:./dev.db";
    console.log("[render-db] DATABASE_URL пустая — для сборки используется file:./dev.db (как в .env.example).");
    return;
  }
  url = String(url).trim();
  if (isPostgresUrl(url)) {
    process.env.DATABASE_URL = url;
    return;
  }
  const fileScheme = url.match(/^file:/i);
  if (fileScheme) {
    process.env.DATABASE_URL = "file:" + url.slice(fileScheme[0].length);
    return;
  }
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) {
    const pathPart =
      url.startsWith("./") || url.startsWith("/") ? url : `./${url.replace(/^\.\//, "")}`;
    process.env.DATABASE_URL = `file:${pathPart}`;
    console.log("[render-db] Для SQLite добавлен префикс file: к DATABASE_URL.");
    return;
  }
  process.env.DATABASE_URL = url;
}

module.exports = {
  stripOuterQuotes,
  isPostgresUrl,
  isSqliteFileUrl,
  sqlitePathFromFileUrl,
  sqliteUrlOnRenderPersistentDisk,
  assertSqliteUrlNotDirectory,
  resolveDatabaseUrlForPrisma,
};
