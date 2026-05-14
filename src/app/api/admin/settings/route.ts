import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession, canManageSettings } from "@/lib/auth";

const patchSchema = z.object({
  phone: z.string().min(5).optional(),
  email: z.string().email().optional(),
  address: z.string().min(3).optional(),
  workHours: z.string().min(3).optional(),
  mapEmbedUrl: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  defaultCreditRate: z.number().min(0).max(60).optional(),
  whatsapp: z.string().nullable().optional(),
  siteTitle: z.string().nullable().optional(),
  siteDescription: z.string().nullable().optional(),
  slogan: z.string().min(3).optional(),
  telegramUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session || !canManageSettings(session.role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const s = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return NextResponse.json({ settings: s });
}

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session || !canManageSettings(session.role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const data = {
    ...d,
    telegramUrl:
      d.telegramUrl === undefined ? undefined : String(d.telegramUrl ?? "").trim() || null,
    instagramUrl:
      d.instagramUrl === undefined ? undefined : String(d.instagramUrl ?? "").trim() || null,
  };

  const s = await prisma.siteSettings.update({
    where: { id: "default" },
    data,
  });
  return NextResponse.json({ settings: s });
}
