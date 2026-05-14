import nodemailer from "nodemailer";
import { LeadType, type Lead } from "@prisma/client";
import { prisma } from "./prisma";
import { getPublicSiteOrigin } from "./site-url";

function typeLabel(t: LeadType) {
  const m: Record<LeadType, string> = {
    TEST_DRIVE: "Тест-драйв",
    CONSULTATION: "Консультация",
    CREDIT: "Кредит",
    TRADE_IN: "Trade-in",
    CALLBACK: "Обратный звонок",
    SERVICE: "Сервис",
    QUESTION: "Вопрос",
    PURCHASE: "Покупка",
    QUICK: "Быстрая заявка",
  };
  return m[t] ?? t;
}

function escapeTelegramHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Уведомление в Telegram только для заявок «Консультация» (форма на главной).
 * Нужны TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в .env / Render.
 */
async function notifyConsultationToTelegram(lead: Lead) {
  if (lead.type !== LeadType.CONSULTATION) return;

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return;

  const lines: string[] = [
    "<b>Новая заявка: консультация</b>",
    "",
    `<b>Имя:</b> ${escapeTelegramHtml(lead.name)}`,
    `<b>Телефон:</b> <code>${escapeTelegramHtml(lead.phone)}</code>`,
  ];

  if (lead.email) {
    lines.push(`<b>Email:</b> ${escapeTelegramHtml(lead.email)}`);
  }
  if (lead.message) {
    lines.push("", `<b>Сообщение:</b>`, escapeTelegramHtml(lead.message));
  }

  if (lead.carId) {
    const car = await prisma.car.findUnique({
      where: { id: lead.carId },
      select: { brand: true, model: true, year: true, slug: true },
    });
    if (car) {
      lines.push("", `<b>Авто:</b> ${escapeTelegramHtml(`${car.brand} ${car.model}, ${car.year}`)}`);
    }
  }

  try {
    const meta = JSON.parse(lead.metaJson || "{}") as Record<string, unknown>;
    const raw = meta.source;
    if (typeof raw === "string" && raw.trim()) {
      lines.push("", `<b>Источник:</b> ${escapeTelegramHtml(raw.trim())}`);
    }
  } catch {
    /* ignore */
  }

  lines.push("", `<i>ID заявки:</i> <code>${escapeTelegramHtml(lead.id)}</code>`);

  const origin = getPublicSiteOrigin();
  if (origin && !origin.includes("localhost")) {
    lines.push(`<a href="${escapeTelegramHtml(`${origin}/admin/leads`)}">Открыть админку</a>`);
  }

  const threadId = process.env.TELEGRAM_MESSAGE_THREAD_ID?.trim();
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text: lines.join("\n"),
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };
  if (threadId && /^\d+$/.test(threadId)) {
    body.message_thread_id = Number(threadId);
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string };
  if (!res.ok || !data.ok) {
    console.error("Telegram sendMessage:", res.status, data);
    throw new Error(data.description || "telegram_send_failed");
  }
}

export async function notifyLeadCreated(lead: Lead) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  const to = settings?.email;
  const host = process.env.SMTP_HOST;
  if (to && host) {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });

    const subject = `[ADRESOV] Новая заявка: ${typeLabel(lead.type)}`;
    const text = [
      `Тип: ${typeLabel(lead.type)}`,
      `Имя: ${lead.name}`,
      `Телефон: ${lead.phone}`,
      lead.email ? `Email: ${lead.email}` : null,
      lead.message ? `Сообщение: ${lead.message}` : null,
      `Мета: ${lead.metaJson}`,
      `ID: ${lead.id}`,
    ]
      .filter(Boolean)
      .join("\n");

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
    });
  }

  try {
    await notifyConsultationToTelegram(lead);
  } catch (e) {
    console.error("notifyConsultationToTelegram", e);
  }
}
