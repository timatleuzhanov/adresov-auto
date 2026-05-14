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
import { getAdminSession, canEditCars } from "@/lib/auth";

async function uniqueSlug(base: string) {
  let slug = base;
  let n = 0;
  while (await prisma.car.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

function makeBaseSlug(brand: string, model: string, year: number) {
  const raw = `${brand}-${model}-${year}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return raw || `car-${year}`;
}

const createSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int(),
  slug: z.string().optional(),
  bodyType: z.nativeEnum(BodyType),
  fuel: z.nativeEnum(FuelType),
  transmission: z.nativeEnum(TransmissionType),
  condition: z.nativeEnum(CarCondition),
  priceFrom: z.number().int().nullable().optional(),
  priceOnRequest: z.boolean().optional(),
  mileage: z.number().int().optional(),
  engine: z.string().min(1),
  drive: z.string().min(1),
  acceleration: z.string().min(1),
  maxSpeed: z.string().min(1),
  fuelConsumption: z.string().min(1),
  trunkVolume: z.string().min(1),
  color: z.string().min(1),
  vin: z.string().nullable().optional(),
  description: z.string().min(1),
  status: z.nativeEnum(CarStatus).optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  titleSeo: z.string().nullable().optional(),
  descSeo: z.string().nullable().optional(),
  images: z.array(z.string().min(3)).min(1).max(15),
  trims: z
    .array(
      z.object({
        name: z.string(),
        price: z.number().int(),
        options: z.array(z.string()).optional(),
      })
    )
    .min(1),
});

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session || !canEditCars(session.role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const where = q
    ? {
        OR: [
          { brand: { contains: q } },
          { model: { contains: q } },
          { slug: { contains: q } },
        ],
      }
    : {};
  const cars = await prisma.car.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: { images: { orderBy: { sort: "asc" }, take: 1 } },
  });
  return NextResponse.json({ cars });
}

export async function POST(req: Request) {
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

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const base = d.slug?.trim() || makeBaseSlug(d.brand, d.model, d.year);
  const slug = await uniqueSlug(base);

  const car = await prisma.car.create({
    data: {
      slug,
      brand: d.brand,
      model: d.model,
      year: d.year,
      bodyType: d.bodyType,
      fuel: d.fuel,
      transmission: d.transmission,
      condition: d.condition,
      priceFrom: d.priceFrom ?? null,
      priceOnRequest: d.priceOnRequest ?? false,
      mileage: d.mileage ?? 0,
      engine: d.engine,
      drive: d.drive,
      acceleration: d.acceleration,
      maxSpeed: d.maxSpeed,
      fuelConsumption: d.fuelConsumption,
      trunkVolume: d.trunkVolume,
      color: d.color,
      vin: d.vin ?? null,
      description: d.description,
      status: d.status ?? CarStatus.IN_STOCK,
      tagsJson: JSON.stringify(d.tags ?? []),
      featured: d.featured ?? false,
      titleSeo: d.titleSeo ?? null,
      descSeo: d.descSeo ?? null,
      images: {
        create: d.images.map((path, i) => ({ path, sort: i })),
      },
      trims: {
        create: d.trims.map((t) => ({
          name: t.name,
          price: t.price,
          optionsJson: JSON.stringify(t.options ?? []),
        })),
      },
    },
  });

  return NextResponse.json({ car });
}
