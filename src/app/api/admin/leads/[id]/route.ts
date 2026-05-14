import { NextResponse } from "next/server";
import { z } from "zod";
import { LeadStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSession, canViewLeads } from "@/lib/auth";

const statusValues = Object.values(LeadStatus) as [LeadStatus, ...LeadStatus[]];

const patchSchema = z.object({
  status: z.enum(statusValues).optional(),
  assignedToId: z.string().nullable().optional(),
  comment: z.string().min(1).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session || !canViewLeads(session.role)) {
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

  const lead = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!lead) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    if (parsed.data.comment) {
      await tx.leadComment.create({
        data: {
          leadId: params.id,
          userId: session.userId,
          text: parsed.data.comment,
        },
      });
    }
    await tx.lead.update({
      where: { id: params.id },
      data: {
        status: parsed.data.status,
        assignedToId:
          parsed.data.assignedToId === undefined
            ? undefined
            : parsed.data.assignedToId === null
              ? null
              : parsed.data.assignedToId,
      },
    });
  });

  const updated = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      car: true,
      comments: { include: { user: { select: { email: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  return NextResponse.json({ lead: updated });
}
