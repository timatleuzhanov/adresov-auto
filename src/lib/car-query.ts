import type { Prisma } from "@prisma/client";
import {
  BodyType,
  CarCondition,
  CarStatus,
  FuelType,
  TransmissionType,
} from "@prisma/client";
import { prisma } from "./prisma";

export const PAGE_SIZE = 12;

export type CatalogQuery = {
  page: number;
  limit?: number;
  featured?: boolean;
  brand?: string;
  bodyTypes: BodyType[];
  fuels: FuelType[];
  transmissions: TransmissionType[];
  condition?: CarCondition;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  sort: "price_asc" | "price_desc" | "newest";
};

export function parseCatalogSearchParams(sp: URLSearchParams): CatalogQuery {
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const brand = sp.get("brand") || undefined;
  const condition = (sp.get("condition") as CarCondition | null) || undefined;
  const minYear = sp.get("minYear") ? parseInt(sp.get("minYear")!, 10) : undefined;
  const maxYear = sp.get("maxYear") ? parseInt(sp.get("maxYear")!, 10) : undefined;
  const minPrice = sp.get("minPrice") ? parseInt(sp.get("minPrice")!, 10) : undefined;
  const maxPrice = sp.get("maxPrice") ? parseInt(sp.get("maxPrice")!, 10) : undefined;
  const sort = (sp.get("sort") as CatalogQuery["sort"] | null) || "newest";

  const parseEnumList = <T extends string>(key: string, allowed: readonly T[]): T[] => {
    const raw = sp.get(key);
    if (!raw) return [];
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter((s): s is T => (allowed as readonly string[]).includes(s));
  };

  const bodyTypes = parseEnumList("bodyTypes", Object.values(BodyType));
  const fuels = parseEnumList("fuels", Object.values(FuelType));
  const transmissions = parseEnumList("transmissions", Object.values(TransmissionType));

  const featured = sp.get("featured") === "1" || sp.get("featured") === "true";
  const limitRaw = sp.get("limit");
  const limitParsed = limitRaw ? parseInt(limitRaw, 10) : NaN;
  const limit = Number.isFinite(limitParsed)
    ? Math.min(24, Math.max(1, limitParsed))
    : undefined;

  return {
    page,
    limit,
    featured: featured || undefined,
    brand,
    bodyTypes,
    fuels,
    transmissions,
    condition: condition && Object.values(CarCondition).includes(condition) ? condition : undefined,
    minYear: Number.isFinite(minYear) ? minYear : undefined,
    maxYear: Number.isFinite(maxYear) ? maxYear : undefined,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    sort: sort === "price_asc" || sort === "price_desc" || sort === "newest" ? sort : "newest",
  };
}

export async function queryCars(q: CatalogQuery) {
  const where: Prisma.CarWhereInput = {
    status: { not: CarStatus.ARCHIVE },
  };

  if (q.featured) where.featured = true;

  if (q.brand) where.brand = { contains: q.brand };
  if (q.bodyTypes.length) where.bodyType = { in: q.bodyTypes };
  if (q.fuels.length) where.fuel = { in: q.fuels };
  if (q.transmissions.length) where.transmission = { in: q.transmissions };
  if (q.condition) where.condition = q.condition;

  if (q.minYear != null || q.maxYear != null) {
    where.year = {};
    if (q.minYear != null) where.year.gte = q.minYear;
    if (q.maxYear != null) where.year.lte = q.maxYear;
  }

  if (q.minPrice != null || q.maxPrice != null) {
    where.priceOnRequest = false;
    where.priceFrom = {};
    if (q.minPrice != null) where.priceFrom.gte = q.minPrice;
    if (q.maxPrice != null) where.priceFrom.lte = q.maxPrice;
  }

  const orderBy: Prisma.CarOrderByWithRelationInput[] =
    q.sort === "price_asc"
      ? [{ priceFrom: "asc" }]
      : q.sort === "price_desc"
        ? [{ priceFrom: "desc" }]
        : [{ createdAt: "desc" }];

  const take = q.limit ?? PAGE_SIZE;
  const skip = q.limit ? 0 : (q.page - 1) * PAGE_SIZE;

  const [total, items] = await prisma.$transaction([
    prisma.car.count({ where }),
    prisma.car.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        images: { orderBy: { sort: "asc" }, take: 1 },
      },
    }),
  ]);

  return { items, total, pageSize: take, page: q.page };
}

export async function getCarAggregates() {
  const [yearAgg, priceAgg] = await Promise.all([
    prisma.car.aggregate({
      where: { status: { not: CarStatus.ARCHIVE } },
      _min: { year: true },
      _max: { year: true },
    }),
    prisma.car.aggregate({
      where: { status: { not: CarStatus.ARCHIVE }, priceOnRequest: false, priceFrom: { not: null } },
      _min: { priceFrom: true },
      _max: { priceFrom: true },
    }),
  ]);
  const y = new Date().getFullYear();
  return {
    minYear: yearAgg._min.year ?? y - 10,
    maxYear: yearAgg._max.year ?? y,
    minPrice: priceAgg._min.priceFrom ?? 0,
    maxPrice: priceAgg._max.priceFrom ?? 50_000_000,
  };
}

export async function getDistinctBrands() {
  const rows = await prisma.car.findMany({
    where: { status: { not: CarStatus.ARCHIVE } },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });
  return rows.map((r) => r.brand);
}
