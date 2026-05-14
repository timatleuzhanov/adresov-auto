import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/settings";

export async function GET() {
  const s = await getSiteSettings();
  if (!s) return NextResponse.json({ error: "Нет настроек" }, { status: 500 });
  return NextResponse.json({
    phone: s.phone,
    email: s.email,
    address: s.address,
    workHours: s.workHours,
    mapEmbedUrl: s.mapEmbedUrl,
    lat: s.lat,
    lng: s.lng,
    defaultCreditRate: s.defaultCreditRate,
    whatsapp: s.whatsapp,
    siteTitle: s.siteTitle,
    siteDescription: s.siteDescription,
    slogan: s.slogan,
    telegramUrl: s.telegramUrl,
    instagramUrl: s.instagramUrl,
  });
}
