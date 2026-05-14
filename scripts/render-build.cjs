const { execSync } = require("child_process");
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

/** Абсолютный путь к файлу БД из SQLite connection string (для проверок на Render). */
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

/** SQLite на диске Render и абсолютные пути вне репозитория на build не работают как ожидается. */
function assertSqlitePathOkForRenderBuild(databaseUrl) {
  if (process.env.RENDER !== "true") return;
  const fsPath = sqlitePathFromFileUrl(databaseUrl);
  if (!fsPath) return;
  try {
    if (fs.existsSync(fsPath) && fs.statSync(fsPath).isDirectory()) {
      console.error(
        `[render-build] ${databaseUrl} указывает на каталог. Задайте путь к файлу базы, например file:/var/data/adresov.db (не только mount point).`
      );
      process.exit(1);
    }
  } catch (_) {
    /* ignore stat errors */
  }
  const n = path.normalize(fsPath);
  if (n === "/var/data" || n.startsWith("/var/data/") || n.startsWith("/mnt/")) {
    console.error(
      "[render-build] SQLite на постоянном диске Render (/var/data, /mnt/...) на этапе build недоступен: диск монтируется у уже запущенного инстанса, а не в среде сборки. Подключите Managed PostgreSQL и укажите DATABASE_URL=postgresql://... (рекомендуется), либо выполняйте prisma db push в startCommand после старта, а не в render:build."
    );
    process.exit(1);
  }
}

/**
 * Prisma SQLite требует ровно префикс `file:` (нижний регистр). На Render часто
 * забывают DATABASE_URL или вставляют postgres-URL с другим регистром схемы.
 */
function resolveDatabaseUrlForPrisma() {
  let url = process.env.DATABASE_URL;
  if (url != null && url !== "") {
    url = stripOuterQuotes(url);
  }
  if (url == null || String(url).trim() === "") {
    if (process.env.RENDER === "true") {
      console.error(
        "[render-build] DATABASE_URL не задана. В Dashboard Render → Environment задайте URL PostgreSQL (Internal Database URL, обычно postgresql://...) или для SQLite строку вида file:./prisma/data.db"
      );
      process.exit(1);
    }
    process.env.DATABASE_URL = "file:./dev.db";
    console.log("[render-build] DATABASE_URL пустая — для сборки используется file:./dev.db (как в .env.example).");
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
  // Путь без протокола (например ./dev.db) — добавляем file:
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) {
    const pathPart =
      url.startsWith("./") || url.startsWith("/") ? url : `./${url.replace(/^\.\//, "")}`;
    process.env.DATABASE_URL = `file:${pathPart}`;
    console.log("[render-build] Для SQLite добавлен префикс file: к DATABASE_URL.");
    return;
  }
  process.env.DATABASE_URL = url;
}

resolveDatabaseUrlForPrisma();
const db = process.env.DATABASE_URL || "";
const childEnv = { ...process.env, DATABASE_URL: db };
const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
let originalSchema = "";
let schemaSwitched = false;

if (isPostgresUrl(db)) {
  originalSchema = fs.readFileSync(schemaPath, "utf8");
  if (originalSchema.includes('provider = "sqlite"')) {
    fs.writeFileSync(
      schemaPath,
      originalSchema.replace('provider = "sqlite"', 'provider = "postgresql"')
    );
    schemaSwitched = true;
    console.log("[render-build] Switched Prisma datasource to postgresql for build/runtime on Render.");
  }
}

try {
  execSync("npx prisma generate", { stdio: "inherit", env: childEnv });

  if (isPostgresUrl(db)) {
    console.log("[render-build] PostgreSQL: migrate deploy (fallback db push)");
    try {
      execSync("npx prisma migrate deploy", { stdio: "inherit", env: childEnv });
    } catch {
      execSync("npx prisma db push --skip-generate", { stdio: "inherit", env: childEnv });
    }
  } else {
    if (!isSqliteFileUrl(db)) {
      const hint = db.length > 48 ? `${db.slice(0, 48)}…` : db;
      console.error(
        `[render-build] Для SQLite нужен DATABASE_URL с префиксом file: (например file:./data.db). Сейчас значение начинается не с file:. Первые символы: ${JSON.stringify(hint)}`
      );
      process.exit(1);
    }
    assertSqlitePathOkForRenderBuild(db);
    console.log("[render-build] SQLite: prisma db push");
    execSync("npx prisma db push --skip-generate", { stdio: "inherit", env: childEnv });
  }

  execSync("npx next build", { stdio: "inherit", env: childEnv });
} catch (e) {
  if (schemaSwitched && originalSchema) {
    fs.writeFileSync(schemaPath, originalSchema);
    console.log("[render-build] Restored prisma/schema.prisma after failed build.");
  }
  throw e;
}

/* Не откатываем schema на sqlite после успешной Postgres-сборки:
 * в slug на Render должен остаться provider=postgresql, иначе `prisma db seed` в Shell падает.
 * В git у разработчика по-прежнему sqlite. */
