# ADRESOV AUTO — веб-сайт (MVP по ТЗ v1.0)

Стек: **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **SQLite** (для локального MVP; в продакшене рекомендуется PostgreSQL по ТЗ), **Framer Motion**, **Swiper**, **React Hook Form + Zod**, **JWT (jose)** для `/admin`, **Sharp** для загрузки изображений.

## Быстрый старт

```bash
cd adresov-web
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Сайт: `http://localhost:3000`  
Админка: `http://localhost:3000/admin` → перенаправит на `/admin/login`.

### Тестовые учётные записи (после `db:seed`)

- **Суперадмин:** `admin@adresov.kz` / пароль из переменной `ADMIN_SEED_PASSWORD` в `.env` (по умолчанию в `.env.example` указан `Admin123!` — задайте свой в `.env`).
- **Менеджер:** `manager@adresov.kz` / `Manager123!`

## Переменные окружения

См. `.env.example`. Важные:

- `DATABASE_URL` — для SQLite: `file:./dev.db` (файл создаётся в `prisma/`).
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — длинные случайные строки (для MVP используется access JWT в cookie `access_token`).
- `ADMIN_SEED_PASSWORD` — пароль сид-суперадмина.
- `SMTP_*` — опционально: если заданы, при создании заявки уходит email через Nodemailer.
- `RECAPTCHA_SECRET`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` — опционально: если секрет не задан, сервер **не блокирует** отправку форм (удобно для локальной разработки).

Публичный базовый URL для метаданных и sitemap:

- `NEXT_PUBLIC_SITE_URL` — например `https://example.kz`
- `NEXT_PUBLIC_TELEGRAM_URL`, `NEXT_PUBLIC_INSTAGRAM_URL` — опционально, если не заданы ссылки в **Админка → Настройки** (`telegramUrl`, `instagramUrl`).

## Сборка (локально)

```bash
npm run build
npm start
```

## Деплой на Render.com

В репозитории есть `render.yaml` (Blueprint). Создайте сервис **Web** и задайте переменные:

- `DATABASE_URL` — для продакшена лучше **PostgreSQL** (Render Postgres или Supabase). Пример: `postgresql://user:pass@host:5432/db?sslmode=require`.
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_SEED_PASSWORD`, `NEXT_PUBLIC_SITE_URL`.

Сборка на Render: `npm ci && npm run render:build`. Скрипт `scripts/render-build.cjs` при `DATABASE_URL` с **postgres** временно меняет в `schema.prisma` провайдер на `postgresql`, выполняет `migrate deploy` (или `db push`), собирает Next.js и **восстанавливает** sqlite-вариант в репозитории кэша сборки.

После первого деплоя с Postgres выполните однократно (через **Shell** на Render): `npx prisma db seed` или заведите админа вручную.

**SQLite на Render** возможен только с **Persistent Disk** и путём вроде `file:/var/data/db.sqlite` — при пересборке без диска данные теряются. Для Supabase ориентируйтесь на PostgreSQL.

## SQLite ↔ PostgreSQL («зеркало» для будущего Supabase)

Одна и та же модель Prisma совместима с обоими движками: локально оставляйте `provider = "sqlite"` и `DATABASE_URL=file:./dev.db`; для Supabase смените в `schema.prisma` на `provider = "postgresql"` и `DATABASE_URL` из панели Supabase, затем:

```bash
npx prisma migrate dev --name init_pg
```

Перенос данных с локального SQLite в Postgres:

1. Экспорт из SQLite: `sqlite3 prisma/dev.db .dump > dump.sql` (при необходимости правьте синтаксис под Postgres).
2. Либо используйте `npx prisma db pull` уже на Postgres после ручного импорта.
3. Либо сгенерируйте SQL-дифф между URL:  
   `npx prisma migrate diff --from-url "file:./prisma/dev.db" --to-url "$DATABASE_URL" --script > prisma/sqlite-to-pg.sql`  
   затем просмотрите и примените скрипт к Postgres (типы и enum могут потребовать ручной правки).

## Логотип

Файл `public/images/logo.png` генерируется командой `npm run logo:generate` (текст «ADRESOV AUTO»; замените на свой макет при необходимости).


## Что реализовано по ТЗ (MVP)

- Публичные страницы: главная (hero, преимущества, акции, популярные модели, калькулятор, CTA, о компании, карта), каталог с фильтрами и пагинацией, карточка авто (галерея, характеристики, комплектации, заявка, похожие), акции, кредит + калькулятор, trade-in, сервис, о компании, контакты, 404.
- Формы заявок → БД (`Lead`), опционально email администратору.
- Аннуитетный кредитный калькулятор на клиенте (как в ТЗ).
- Админ-панель `/admin`: вход, роли, дашборд, **полная форма создания автомобиля**, список и просмотр авто, заявки, акции, настройки сайта (в т.ч. Telegram/Instagram), загрузка изображений в `public/uploads`.
- SEO: `sitemap.xml`, `robots.txt` (закрыт `/admin`), метаданные, JSON-LD на карточке авто.
- Дизайн-система из ТЗ: цвета Montserrat/Inter, тени и скругления.

## Что вынесено за рамки MVP или упрощено

- **2FA (TOTP / email)**, refresh-token ротация, Redis, отдельный Nest/Express-сервер, PostgreSQL в репозитории — подключение PostgreSQL сводится к смене `DATABASE_URL` и `provider` в `schema.prisma`.
- **reCAPTCHA v3**, **SMS (SMSC.kz)**, **Яндекс.Метрика/GA** — предусмотрены переменными и точками расширения; без ключей формы работают локально.
- Полный Swagger, CI/CD, Docker, S3 — не включены в этот MVP-пакет.

## Полезные команды

```bash
npm run db:push    # применить схему Prisma
npm run db:seed    # пересоздать демо-данные (удаляет авто/акции/комментарии к лидам)
npm run lint
```
