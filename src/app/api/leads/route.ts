import { NextResponse } from "next/server";
import { z } from "zod";
import { LeadType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { notifyLeadCreated } from "@/lib/notify-lead";

const phoneRegex = /^[\d+\s()\-]{10,}$/;
const leadTypes = Object.values(LeadType) as [LeadType, ...LeadType[]];

const schema = z.object({
  type: z.enum(leadTypes),
  name: z.string().min(2, "Укажите имя"),
  phone: z.string().regex(phoneRegex, "Укажите корректный телефон"),
  email: z.string().max(200).optional(),
  message: z.string().optional(),
  carId: z.string().optional(),
  carSlug: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
  consent: z.boolean().refine((v) => v === true, { message: "Нужно согласие с политикой" }),
  recaptchaToken: z.string().optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const okCaptcha = await verifyRecaptcha(parsed.data.recaptchaToken);
  if (!okCaptcha) {
    return NextResponse.json({ error: "Проверка reCAPTCHA не пройдена" }, { status: 400 });
  }

  let carId = parsed.data.carId;
  if (!carId && parsed.data.carSlug) {
    const car = await prisma.car.findUnique({ where: { slug: parsed.data.carSlug } });
    carId = car?.id;
  }

  const lead = await prisma.lead.create({
    data: {
      type: parsed.data.type,
      name: parsed.data.name.trim(),
      phone: parsed.data.phone.trim(),
      email: parsed.data.email?.trim() || null,
      message: parsed.data.message?.trim() || null,
      carId: carId || null,
      metaJson: JSON.stringify(parsed.data.meta ?? {}),
    },
  });

  try {
    await notifyLeadCreated(lead);
  } catch (e) {
    console.error("notifyLeadCreated", e);
  }

  return NextResponse.json({ ok: true, id: lead.id });
}
