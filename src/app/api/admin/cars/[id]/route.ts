import { NextResponse } from "next/server";
import { z } from "zod";
import {
  BodyType,
  CarCondition,
  CarStatus,
  FuelType,
  TransmissionType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSession, canDeleteCars, canEditCars } from "@/lib/auth";

const patchSchema = z
  .object({
    brand: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    year: z.number().int().optional(),
    slug: z.string().optional(),
    bodyType: z.nativeEnum(BodyType).optional(),
    fuel: z.nativeEnum(FuelType).optional(),
    transmission: z.nativeEnum(TransmissionType).optional(),
    condition: z.nativeEnum(CarCondition).optional(),
    priceFrom: z.number().int().nullable().optional(),
    priceUsd: z.number().int().nullable().optional(),
    priceRub: z.number().int().nullable().optional(),
    priceOnRequest: z.boolean().optional(),
    mileage: z.number().int().optional(),
    engine: z.string().min(1).optional(),
    drive: z.string().min(1).optional(),
    acceleration: z.string().min(1).optional(),
    maxSpeed: z.string().min(1).optional(),
    fuelConsumption: z.string().min(1).optional(),
    trunkVolume: z.string().min(1).optional(),
    color: z.string().min(1).optional(),
    vin: z.string().nullable().optional(),
    description: z.string().min(1).optional(),
    status: z.nativeEnum(CarStatus).optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    titleSeo: z.string().nullable().optional(),
    descSeo: z.string().nullable().optional(),
    images: z.array(z.string().min(3)).max(15).optional(),
    trims: z
      .array(
        z.object({
          name: z.string(),
          price: z.number().int(),
          options: z.array(z.string()).optional(),
        })
      )
      .optional(),
  })
  .strict();

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session || !canEditCars(session.role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const car = await prisma.car.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { sort: "asc" } }, trims: { orderBy: { price: "asc" } } },
  });
  if (!car) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json({ car });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session || !canEditCars(session.role)) {
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
  const existing = await prisma.car.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  let slug = existing.slug;
  if (d.slug && d.slug !== existing.slug) {
    const taken = await prisma.car.findFirst({ where: { slug: d.slug, NOT: { id: params.id } } });
    slug = taken ? existing.slug : d.slug;
  }

  await prisma.$transaction(async (tx) => {
    if (d.images) {
      await tx.carImage.deleteMany({ where: { carId: params.id } });
      await tx.carImage.createMany({
        data: d.images.map((path, i) => ({ carId: params.id, path, sort: i })),
      });
    }
    if (d.trims) {
      await tx.carTrim.deleteMany({ where: { carId: params.id } });
      await tx.carTrim.createMany({
        data: d.trims.map((t) => ({
          carId: params.id,
          name: t.name,
          price: t.price,
          optionsJson: JSON.stringify(t.options ?? []),
        })),
      });
    }

    await tx.car.update({
      where: { id: params.id },
      data: {
        slug,
        brand: d.brand,
        model: d.model,
        year: d.year,
        bodyType: d.bodyType,
        fuel: d.fuel,
        transmission: d.transmission,
        condition: d.condition,
        priceFrom: d.priceFrom === undefined ? undefined : d.priceFrom,
        priceUsd: d.priceUsd === undefined ? undefined : d.priceUsd,
        priceRub: d.priceRub === undefined ? undefined : d.priceRub,
        priceOnRequest: d.priceOnRequest,
        mileage: d.mileage,
        engine: d.engine,
        drive: d.drive,
        acceleration: d.acceleration,
        maxSpeed: d.maxSpeed,
        fuelConsumption: d.fuelConsumption,
        trunkVolume: d.trunkVolume,
        color: d.color,
        vin: d.vin === undefined ? undefined : d.vin,
        description: d.description,
        status: d.status,
        featured: d.featured,
        titleSeo: d.titleSeo === undefined ? undefined : d.titleSeo,
        descSeo: d.descSeo === undefined ? undefined : d.descSeo,
        tagsJson: d.tags ? JSON.stringify(d.tags) : undefined,
      },
    });
  });

  const car = await prisma.car.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { sort: "asc" } }, trims: { orderBy: { price: "asc" } } },
  });
  return NextResponse.json({ car });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session || !canDeleteCars(session.role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  await prisma.car.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
