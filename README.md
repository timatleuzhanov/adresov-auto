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

Полный шаблон с комментариями — в [`.env.example`](./.env.example). Кратко:

- `DATABASE_URL` — локально SQLite: `file:./dev.db` (файл в каталоге `prisma/`). На Render — URL **PostgreSQL**.
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — длинные случайные строки (для продакшена не используйте значения из примера).
- `ADMIN_SEED_PASSWORD` — пароль сид-суперадмина.
- `NEXT_PUBLIC_SITE_URL` — локально `http://localhost:3000`, на проде — HTTPS-URL сервиса.
- `SMTP_*`, `RECAPTCHA_*`, `NEXT_PUBLIC_TELEGRAM_URL`, `NEXT_PUBLIC_INSTAGRAM_URL` — опционально (см. `.env.example`).

## Сборка (локально)

```bash
npm run build
npm start
```

## Деплой на Render.com

Репозиторий: корень = приложение Next (`package.json` на верхнем уровне). Подключите [GitHub `adresov-auto`](https://github.com/timatleuzhanov/adresov-auto) как **Web Service** или используйте Blueprint из [`render.yaml`](./render.yaml).

### Команды в панели Render (если создаёте сервис вручную)

| Поле | Значение |
|------|----------|
| **Runtime** | Node |
| **Build Command** | `npm ci && npm run render:build` |
| **Start Command** | `npm run start` |
| **Health Check Path** | `/` |

`npm run render:build` запускает [`scripts/render-build.cjs`](./scripts/render-build.cjs): при `DATABASE_URL` с **postgres** временно переключает `provider` в `schema.prisma` на PostgreSQL, выполняет `prisma migrate deploy` (если есть миграции) или **`prisma db push`**, затем `next build`. После успешной сборки файл схемы в деплое остаётся с **postgresql** — так в **Shell** на Render работает `npx prisma db seed`.

### Переменные окружения на Render

Задайте в **Environment** (одинаково для build и runtime; Render подставляет их на этапе сборки):

**Обязательно**

| Переменная | Описание |
|------------|----------|
| `DATABASE_URL` | **Рекомендуется PostgreSQL** (создайте **PostgreSQL** в Render и вставьте **Internal Database URL**, часто с суффиксом `?sslmode=require`). SQLite на обычном Web Service без диска не подходит — данные пропадут при деплое. |
| `JWT_ACCESS_SECRET` | Случайная строка **≥ 32 символов** (например `openssl rand -hex 32`). |
| `JWT_REFRESH_SECRET` | Зарезервировано под будущий refresh-flow; пока в коде не используется, но задайте ту же длину, что и у access. |
| `ADMIN_SEED_PASSWORD` | Пароль суперадмина для `npx prisma db seed` в Shell после первого деплоя. |
| `NEXT_PUBLIC_SITE_URL` | Публичный URL сервиса, например `https://adresov-auto.onrender.com` (для `metadataBase`, sitemap, robots). |

**Опционально**

| Переменная | Описание |
|------------|----------|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Почта при новой заявке (`notify-lead`). |
| `RECAPTCHA_SECRET`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA v3; без секрета формы всё равно принимаются. |
| `NEXT_PUBLIC_TELEGRAM_URL`, `NEXT_PUBLIC_INSTAGRAM_URL` | Если не заданы в админке → настройки сайта. |
| `NODE_VERSION` | `20` (как в `render.yaml`; в дашборде можно выбрать Node 20 вместо env). |

После первого успешного деплоя: **Render Shell** → `npx prisma db seed` (создаёт настройки по умолчанию, демо-авто, пользователей). Вход в админку: `admin@adresov.kz` / пароль из `ADMIN_SEED_PASSWORD`.

### Локально без сюрпризов

```bash
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

- **`npm run build`** / **`npm start`**: нужен рабочий `.env` с `DATABASE_URL` и созданная БД (`db push` или существующий файл SQLite).
- Корневой **`export const dynamic = "force-dynamic"`** в `layout` и на страницах с Prisma снижает риск падения **`next build`** без доступной БД; для продакшена на Render с Postgres всё равно задавайте `DATABASE_URL` до сборки.

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
