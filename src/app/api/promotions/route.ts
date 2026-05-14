import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const items = await prisma.promotion.findMany({
    where: { startDate: { lte: now }, endDate: { gte: now } },
    orderBy: { endDate: "asc" },
    include: {
      cars: {
        include: {
          car: {
            include: { images: { orderBy: { sort: "asc" }, take: 1 } },
          },
        },
      },
    },
  });
  return NextResponse.json({ items });
}
