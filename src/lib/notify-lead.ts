import nodemailer from "nodemailer";
import type { Lead, LeadType } from "@prisma/client";
import { prisma } from "./prisma";

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

export async function notifyLeadCreated(lead: Lead) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  const to = settings?.email;
  const host = process.env.SMTP_HOST;
  if (!to || !host) return;

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
