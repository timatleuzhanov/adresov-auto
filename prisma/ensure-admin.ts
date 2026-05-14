import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@adresov.kz";

async function main() {
  const adminPass = process.env.ADMIN_SEED_PASSWORD || "Admin123!";
  const passwordHash = await bcrypt.hash(adminPass, 10);

  if (process.env.RENDER === "true") {
    await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: { passwordHash, role: UserRole.SUPERADMIN, failedAttempts: 0, lockedUntil: null },
      create: {
        email: ADMIN_EMAIL,
        passwordHash,
        role: UserRole.SUPERADMIN,
      },
    });
    console.log(
      `[ensure-admin] ${ADMIN_EMAIL} — пароль совпадает с ADMIN_SEED_PASSWORD в Environment (или Admin123!, если не задан).`
    );
  } else {
    const exists = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
    if (!exists) {
      await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          passwordHash,
          role: UserRole.SUPERADMIN,
        },
      });
      console.log(`[ensure-admin] Создан первый суперадмин ${ADMIN_EMAIL}`);
    }
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (!settings) {
    await prisma.siteSettings.create({
      data: {
        id: "default",
        phone: "+7 (727) 000-00-00",
        email: "info@adresov.kz",
        address: "г. Алматы, ул. Примерная, 1",
        workHours: "Пн–Сб 9:00–20:00, Вс 10:00–18:00",
        mapEmbedUrl: null,
        lat: 43.238949,
        lng: 76.889709,
        defaultCreditRate: 14.5,
        whatsapp: "77001234567",
        siteTitle: "ADRESOV AUTO — официальный автосалон в Алматы",
        siteDescription:
          "Новые и подержанные автомобили, кредит, лизинг, trade-in, сервис и тест-драйв.",
        slogan: "Ваш путь к идеальному автомобилю начинается здесь",
        telegramUrl: "https://t.me/adresovauto",
        instagramUrl: "https://www.instagram.com/adresovauto",
      },
    });
    console.log("[ensure-admin] Созданы настройки сайта по умолчанию");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
