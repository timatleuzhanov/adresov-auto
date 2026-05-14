import { NextResponse } from "next/server";
import { mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { getAdminSession, canEditCars } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session || !canEditCars(session.role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Максимум 5 МБ" }, { status: 400 });
  }

  const mime = file.type;
  if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
    return NextResponse.json({ error: "Допустимы JPEG, PNG, WebP" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const name = `${randomUUID()}.webp`;
  const outPath = path.join(uploadsDir, name);

  await sharp(buf)
    .rotate()
    .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(outPath);

  return NextResponse.json({ url: `/uploads/${name}` });
}
