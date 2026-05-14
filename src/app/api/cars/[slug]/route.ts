import { NextResponse } from "next/server";
import { CarStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const car = await prisma.car.findFirst({
    where: { slug: params.slug, status: { not: CarStatus.ARCHIVE } },
    include: {
      images: { orderBy: { sort: "asc" } },
      trims: { orderBy: { price: "asc" } },
    },
  });
  if (!car) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  const similar = await prisma.car.findMany({
    where: {
      id: { not: car.id },
      status: { not: CarStatus.ARCHIVE },
      OR: [{ brand: car.brand }, { bodyType: car.bodyType }],
    },
    take: 4,
    include: { images: { orderBy: { sort: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ car, similar });
}
