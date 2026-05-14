const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

async function main() {
  const dir = path.join(process.cwd(), "public", "images");
  fs.mkdirSync(dir, { recursive: true });
  const w = 280;
  const h = 56;
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="22" fill="#ffffff">ADRESOV AUTO</text></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(dir, "logo.png"));
  console.log("Wrote public/images/logo.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
