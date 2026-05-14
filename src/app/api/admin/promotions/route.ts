import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession, canManagePromotions } from "@/lib/auth";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  image: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  carIds: z.array(z.string()).optional(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session || !canManagePromotions(session.role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const items = await prisma.promotion.findMany({
    orderBy: { endDate: "desc" },
    include: { cars: { include: { car: { select: { id: true, brand: true, model: true } } } } },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session || !canManagePromotions(session.role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const promo = await prisma.promotion.create({
    data: {
      title: d.title,
      description: d.description,
      image: d.image || null,
      startDate: new Date(d.startDate),
      endDate: new Date(d.endDate),
      cars: d.carIds?.length
        ? { create: d.carIds.map((carId) => ({ carId })) }
        : undefined,
    },
  });

  return NextResponse.json({ promotion: promo });
}
