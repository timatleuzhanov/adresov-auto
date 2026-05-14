import { prisma } from "./prisma";

export async function getSiteSettings() {
  return prisma.siteSettings.findUnique({ where: { id: "default" } });
}
