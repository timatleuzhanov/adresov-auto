import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAccessToken } from "@/lib/auth";
import {
  checkLoginBlocked,
  clearLoginFailures,
  recordLoginFailure,
} from "@/lib/login-rate-limit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const block = checkLoginBlocked(ip);
  if (block.blocked) {
    return NextResponse.json(
      { error: "Слишком много попыток входа", retryAfter: block.retryAfterSec },
      { status: 429 }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    recordLoginFailure(ip);
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return NextResponse.json({ error: "Аккаунт временно заблокирован" }, { status: 423 });
  }

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) {
    const fails = user.failedAttempts + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: fails,
        lockedUntil: fails >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : user.lockedUntil,
      },
    });
    recordLoginFailure(ip);
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lockedUntil: null },
  });
  clearLoginFailures(ip);

  const token = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
