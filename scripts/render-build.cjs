const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const {
  resolveDatabaseUrlForPrisma,
  isPostgresUrl,
  isSqliteFileUrl,
  sqliteUrlOnRenderPersistentDisk,
  assertSqliteUrlNotDirectory,
} = require("./render-db-util.cjs");

/** Только для `next build` на Render: диск /var/data недоступен, Prisma всё равно дергается при SSG. */
const TEMP_BUILD_SQLITE = "file:./.render-build.sqlite";

function unlinkIfExists(p) {
  try {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch (_) {
    /* ignore */
  }
}

function cleanupRenderBuildTempSqlite() {
  const file = path.join(process.cwd(), ".render-build.sqlite");
  unlinkIfExists(file);
  unlinkIfExists(`${file}-journal`);
  unlinkIfExists(`${file}-wal`);
  unlinkIfExists(`${file}-shm`);
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
    assertSqliteUrlNotDirectory(db);
    const skipDiskPush =
      process.env.RENDER === "true" && sqliteUrlOnRenderPersistentDisk(db);
    if (skipDiskPush) {
      console.log(
        "[render-build] Пропуск prisma db push: SQLite на /var/data или /mnt/ — диск доступен только при старте; db push выполнит npm run render:start."
      );
    } else {
      console.log("[render-build] SQLite: prisma db push");
      execSync("npx prisma db push --skip-generate", { stdio: "inherit", env: childEnv });
    }
  }

  let nextBuildEnv = childEnv;
  let usedTempSqliteForNextBuild = false;
  try {
    if (
      process.env.RENDER === "true" &&
      !isPostgresUrl(db) &&
      isSqliteFileUrl(db) &&
      sqliteUrlOnRenderPersistentDisk(db)
    ) {
      usedTempSqliteForNextBuild = true;
      nextBuildEnv = { ...childEnv, DATABASE_URL: TEMP_BUILD_SQLITE };
      console.log(
        "[render-build] Временный SQLite для next build (SSG вызывает API/Prisma; постоянный диск при сборке недоступен)."
      );
      execSync("npx prisma db push --skip-generate", { stdio: "inherit", env: nextBuildEnv });
    }

    execSync("npx next build", { stdio: "inherit", env: nextBuildEnv });
  } finally {
    if (usedTempSqliteForNextBuild) {
      cleanupRenderBuildTempSqlite();
    }
  }
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
