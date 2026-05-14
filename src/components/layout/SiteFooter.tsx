"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Site = {
  phone: string;
  address: string;
  workHours: string;
  telegramUrl?: string | null;
  instagramUrl?: string | null;
};

export function SiteFooter() {
  const pathname = usePathname();
  const [site, setSite] = useState<Site | null>(null);

  useEffect(() => {
    fetch("/api/site")
      .then((r) => r.json())
      .then(setSite)
      .catch(() => setSite(null));
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-16 border-t border-logo/20 bg-black text-logo">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <Image src="/images/logo.png" alt="ADRESOV AUTO" width={280} height={56} className="h-11 w-auto object-contain object-left opacity-95 md:h-14" />
          <p className="mt-4 text-sm text-logo/70">Новые и автомобили с пробегом. Сервис, кредит, trade-in.</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {site?.telegramUrl && (
              <a href={site.telegramUrl} target="_blank" rel="noopener noreferrer" className="text-logo/80 hover:text-logo-bright">
                Telegram
              </a>
            )}
            {site?.instagramUrl && (
              <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-logo/80 hover:text-logo-bright">
                Instagram
              </a>
            )}
          </div>
        </div>
        <div className="text-sm">
          <div className="font-heading font-semibold text-logo-bright">Разделы</div>
          <ul className="mt-3 space-y-2 text-logo/75">
            <li>
              <Link href="/catalog" className="hover:text-logo-bright">
                Каталог
              </Link>
            </li>
            <li>
              <Link href="/promotions" className="hover:text-logo-bright">
                Акции
              </Link>
            </li>
            <li>
              <Link href="/contacts" className="hover:text-logo-bright">
                Контакты
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="font-heading font-semibold text-logo-bright">Контакты</div>
          <p className="mt-3 text-logo/75">{site?.address}</p>
          <p className="mt-2">
            <a href={`tel:${site?.phone?.replace(/\s/g, "")}`} className="font-semibold text-logo-bright hover:underline">
              {site?.phone}
            </a>
          </p>
          <p className="mt-2 text-logo/65">{site?.workHours}</p>
        </div>
      </div>
      <div className="border-t border-logo/20 py-4 text-center text-xs text-logo/50">
        © {new Date().getFullYear()} ADRESOV AUTO
      </div>
    </footer>
  );
}
