import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { prisma } from "@/lib/prisma";

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
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
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
        <SiteHeader />
        <main className="min-h-[60vh]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
