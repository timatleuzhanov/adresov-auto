const { execSync } = require("child_process");
const {
  resolveDatabaseUrlForPrisma,
  isPostgresUrl,
  isSqliteFileUrl,
  sqliteUrlOnRenderPersistentDisk,
  assertSqliteUrlNotDirectory,
} = require("./render-db-util.cjs");

resolveDatabaseUrlForPrisma();
const db = process.env.DATABASE_URL || "";
const childEnv = { ...process.env, DATABASE_URL: db };

if (isSqliteFileUrl(db)) {
  assertSqliteUrlNotDirectory(db);
}

if (
  isSqliteFileUrl(db) &&
  process.env.RENDER === "true" &&
  sqliteUrlOnRenderPersistentDisk(db)
) {
  console.log("[render-start] SQLite на постоянном диске Render: prisma db push перед next start");
  execSync("npx prisma db push --skip-generate", { stdio: "inherit", env: childEnv });
}

execSync("next start", { stdio: "inherit", env: childEnv });
