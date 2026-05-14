import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { CarStatus } from "@prisma/client";
import { getPublicSiteOrigin } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicSiteOrigin();
  const cars = await prisma.car.findMany({
    where: { status: { not: CarStatus.ARCHIVE } },
    select: { slug: true, updatedAt: true },
  });

  const staticRoutes = ["", "/catalog", "/promotions", "/credit", "/trade-in", "/service", "/about", "/contacts"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })
  );

  const carRoutes = cars.map((c) => ({
    url: `${base}/catalog/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...carRoutes];
}
