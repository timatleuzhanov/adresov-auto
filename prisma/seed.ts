import {
  PrismaClient,
  BodyType,
  FuelType,
  TransmissionType,
  CarCondition,
  CarStatus,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Стабильные фото автомобилей и салона (Unsplash, демо). */
const U = (photoId: string, w = 1400) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${w}&q=82`;

const STOCK = {
  sportage: [
    U("photo-1533473359331-0135ef1b58bf"),
    U("photo-1549317661-bd32c8ce0db2"),
    U("photo-1503376780353-7e669276fa82"),
  ],
  camry: [U("photo-1621007947382-bb3c3994e3fb"), U("photo-1583121274602-3a282cdb7bfa")],
  tucson: [U("photo-1519641471654-76ce0107ad1b")],
  bmw: [U("photo-1555215695-3004980ad54e"), U("photo-1617531653332-bd46c24f0668")],
  promo: U("photo-1560472354-b33ff0c44a43", 1600),
} as const;

async function main() {
  const adminPass = process.env.ADMIN_SEED_PASSWORD || "Admin123!";
  const hash = await bcrypt.hash(adminPass, 10);

  await prisma.user.upsert({
    where: { email: "admin@adresov.kz" },
    update: { passwordHash: hash, role: UserRole.SUPERADMIN },
    create: {
      email: "admin@adresov.kz",
      passwordHash: hash,
      role: UserRole.SUPERADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "manager@adresov.kz" },
    update: {},
    create: {
      email: "manager@adresov.kz",
      passwordHash: await bcrypt.hash("Manager123!", 10),
      role: UserRole.MANAGER,
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      telegramUrl: "https://t.me/adresovauto",
      instagramUrl: "https://www.instagram.com/adresovauto",
    },
    create: {
      id: "default",
      phone: "+7 (727) 000-00-00",
      email: "info@adresov.kz",
      address: "г. Алматы, ул. Примерная, 1",
      workHours: "Пн–Сб 9:00–20:00, Вс 10:00–18:00",
      mapEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2906.5!2d76.9!3d43.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDEyJzAwLjAiTiA3NsKwNTQnMDAuMCJF!5e0!3m2!1sru!2skz!4v1",
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

  await prisma.leadComment.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.promotionCar.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.carImage.deleteMany();
  await prisma.carTrim.deleteMany();
  await prisma.car.deleteMany();

  const carsData = [
    {
      slug: "kia-sportage-2024",
      brand: "Kia",
      model: "Sportage",
      year: 2024,
      bodyType: BodyType.CROSSOVER,
      fuel: FuelType.PETROL,
      transmission: TransmissionType.AUTO,
      condition: CarCondition.NEW,
      priceFrom: 15_990_000,
      priceOnRequest: false,
      mileage: 0,
      engine: "2.0 л, 150 л.с., бензин",
      drive: "Полный (AWD)",
      acceleration: "9,2 с",
      maxSpeed: "195 км/ч",
      fuelConsumption: "8,1 л / 100 км",
      trunkVolume: "543 л",
      color: "Серый металлик",
      vin: "KNAPXXXXXXXXXXXXX",
      description:
        "Популярный кроссовер с богатой комплектацией и полным приводом. В наличии на площадке.",
      status: CarStatus.IN_STOCK,
      tagsJson: JSON.stringify(["Новинка", "Хит продаж"]),
      featured: true,
      images: [...STOCK.sportage],
      trims: [
        { name: "Comfort", price: 15_990_000, options: ["Мультимедиа 8 дюймов", "Камера заднего вида"] },
        { name: "Prestige", price: 17_490_000, options: ["Панорама", "Подогрев руля", "LED"] },
      ],
    },
    {
      slug: "toyota-camry-2023",
      brand: "Toyota",
      model: "Camry",
      year: 2023,
      bodyType: BodyType.SEDAN,
      fuel: FuelType.PETROL,
      transmission: TransmissionType.AUTO,
      condition: CarCondition.USED,
      priceFrom: 18_500_000,
      priceOnRequest: false,
      mileage: 24_000,
      engine: "2.5 л, 181 л.с., бензин",
      drive: "Передний",
      acceleration: "8,3 с",
      maxSpeed: "210 км/ч",
      fuelConsumption: "7,2 л / 100 км",
      trunkVolume: "524 л",
      color: "Чёрный",
      vin: "JTNBXXXXXXXXXXXXX",
      description: "Один владелец, сервисная история. Состояние отличное.",
      status: CarStatus.IN_STOCK,
      tagsJson: JSON.stringify(["С пробегом"]),
      featured: true,
      images: [...STOCK.camry],
      trims: [{ name: "Premium", price: 18_500_000, options: ["Кожа", "JBL", "TSS 2.5"] }],
    },
    {
      slug: "hyundai-tucson-2024",
      brand: "Hyundai",
      model: "Tucson",
      year: 2024,
      bodyType: BodyType.SUV,
      fuel: FuelType.PETROL,
      transmission: TransmissionType.AUTO,
      condition: CarCondition.NEW,
      priceFrom: 16_200_000,
      priceOnRequest: false,
      mileage: 0,
      engine: "2.0 л, 150 л.с., бензин",
      drive: "Полный",
      acceleration: "9,5 с",
      maxSpeed: "200 км/ч",
      fuelConsumption: "8,5 л / 100 км",
      trunkVolume: "620 л",
      color: "Белый перламутр",
      vin: null,
      description: "Современный дизайн и высокий уровень безопасности.",
      status: CarStatus.ON_ORDER,
      tagsJson: JSON.stringify(["Акция"]),
      featured: true,
      images: [...STOCK.tucson],
      trims: [{ name: "Style", price: 16_200_000, options: ["SmartSense", "Приборная панель 12.3 дюйма"] }],
    },
    {
      slug: "bmw-x5-2022",
      brand: "BMW",
      model: "X5",
      year: 2022,
      bodyType: BodyType.SUV,
      fuel: FuelType.PETROL,
      transmission: TransmissionType.AUTO,
      condition: CarCondition.USED,
      priceFrom: 42_000_000,
      priceOnRequest: true,
      mileage: 38_000,
      engine: "3.0 л, 340 л.с., бензин",
      drive: "Полный xDrive",
      acceleration: "5,5 с",
      maxSpeed: "250 км/ч",
      fuelConsumption: "10,5 л / 100 км",
      trunkVolume: "650 л",
      color: "Синий",
      vin: "WBAXXXXXXXXXXXXXX",
      description: "Премиальный SUV. Уточняйте актуальную цену у менеджера.",
      status: CarStatus.IN_STOCK,
      tagsJson: JSON.stringify([]),
      featured: true,
      images: [...STOCK.bmw],
      trims: [{ name: "xDrive40i", price: 42_000_000, options: ["M-пакет", "Пневмоподвеска"] }],
    },
  ];

  const created: { id: string; slug: string }[] = [];

  for (const c of carsData) {
    const { images, trims, ...rest } = c;
    const car = await prisma.car.create({
      data: {
        ...rest,
        images: { create: images.map((path, i) => ({ path, sort: i })) },
        trims: {
          create: trims.map((t) => ({
            name: t.name,
            price: t.price,
            optionsJson: JSON.stringify(t.options),
          })),
        },
      },
    });
    created.push({ id: car.id, slug: car.slug });
  }

  const sportage = created.find((x) => x.slug === "kia-sportage-2024");
  const camry = created.find((x) => x.slug === "toyota-camry-2023");
  const now = new Date();
  const promoEnd = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);
  if (sportage && camry) {
    await prisma.promotion.create({
      data: {
        title: "Кредит от 0% на выбранные модели",
        description: "Специальные условия банков-партнёров до конца месяца.",
        image: STOCK.promo,
        startDate: now,
        endDate: promoEnd,
        cars: {
          create: [{ carId: sportage.id }, { carId: camry.id }],
        },
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
