import { NextResponse } from "next/server";
import { LeadStatus, LeadType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSession, canViewLeads } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session || !canViewLeads(session.role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as LeadStatus | null;
  const type = searchParams.get("type") as LeadType | null;

  const leads = await prisma.lead.findMany({
    where: {
      ...(status && Object.values(LeadStatus).includes(status) ? { status } : {}),
      ...(type && Object.values(LeadType).includes(type) ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      car: { select: { brand: true, model: true, year: true, slug: true } },
      assignedTo: { select: { email: true } },
      comments: { include: { user: { select: { email: true } } }, orderBy: { createdAt: "desc" } },
    },
  });

  const counts = await prisma.lead.groupBy({
    by: ["type"],
    _count: { _all: true },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const newToday = await prisma.lead.count({ where: { createdAt: { gte: today } } });

  return NextResponse.json({ leads, counts, newToday });
}
