const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const db = process.env.DATABASE_URL || "";
const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
let schemaRestored = false;
let originalSchema = "";

if (db.startsWith("postgresql:") || db.startsWith("postgres:")) {
  originalSchema = fs.readFileSync(schemaPath, "utf8");
  if (originalSchema.includes('provider = "sqlite"')) {
    fs.writeFileSync(
      schemaPath,
      originalSchema.replace('provider = "sqlite"', 'provider = "postgresql"')
    );
    schemaRestored = true;
    console.log("[render-build] Switched Prisma datasource to postgresql for build.");
  }
}

try {
  execSync("npx prisma generate", { stdio: "inherit" });

  if (db.startsWith("postgresql:") || db.startsWith("postgres:")) {
    console.log("[render-build] PostgreSQL: migrate deploy (fallback db push)");
    try {
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
    } catch {
      execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
    }
  } else {
    console.log("[render-build] SQLite: prisma db push");
    execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
  }

  execSync("npx next build", { stdio: "inherit" });
} finally {
  if (schemaRestored && originalSchema) {
    fs.writeFileSync(schemaPath, originalSchema);
    console.log("[render-build] Restored prisma/schema.prisma (sqlite for repo).");
  }
}
