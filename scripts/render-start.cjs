const { execSync } = require("child_process");
const {
  resolveDatabaseUrlForPrisma,
  isPostgresUrl,
  isSqliteFileUrl,
  assertSqliteUrlNotDirectory,
} = require("./render-db-util.cjs");

resolveDatabaseUrlForPrisma();
const db = process.env.DATABASE_URL || "";
const childEnv = { ...process.env, DATABASE_URL: db };

if (isSqliteFileUrl(db)) {
  assertSqliteUrlNotDirectory(db);
}

/* На Render при `npm start` раньше вызывался только next start — без db push на диске
 * остаётся пустой файл и P2021 (таблиц нет). Idempotent push перед сервером. */
if (process.env.RENDER === "true" && isSqliteFileUrl(db) && !isPostgresUrl(db)) {
  console.log("[render-start] SQLite на Render: prisma db push перед next start");
  execSync("npx prisma db push --skip-generate", { stdio: "inherit", env: childEnv });
}

/* db push не создаёт пользователей — без seed в БД нет admin@adresov.kz, логин как «неверный пароль». */
if (process.env.RENDER === "true") {
  console.log("[render-start] prisma/ensure-admin.ts — админ и настройки сайта");
  execSync("npx tsx prisma/ensure-admin.ts", { stdio: "inherit", env: childEnv });
}

execSync("next start", { stdio: "inherit", env: childEnv });
