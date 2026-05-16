import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Providers } from "@/components/layout/Providers";
import { prisma } from "@/lib/prisma";
import { getPublicSiteUrl } from "@/lib/site-url";

/** Не дергать БД на этапе `next build` без DATABASE_URL (удобнее локально и в CI). */
export const dynamic = "force-dynamic";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
  weight: ["600", "700"],
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return {
    title: s?.siteTitle ?? "ADRESOV AUTO",
    description: s?.siteDescription ?? "Официальный автосалон в Алматы",
    metadataBase: getPublicSiteUrl(),
    openGraph: {
      title: s?.siteTitle ?? "ADRESOV AUTO",
      description: s?.siteDescription ?? "",
      locale: "ru_KZ",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${montserrat.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-white font-sans antialiased" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <Providers>
          <SiteHeader />
          <main className="min-h-[60vh]">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
