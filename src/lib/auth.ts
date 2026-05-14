import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";

export type AdminSession = { userId: string; email: string; role: UserRole };

function accessSecret() {
  return new TextEncoder().encode(process.env.JWT_ACCESS_SECRET || "dev-access-insecure-32chars-min");
}

export async function signAccessToken(payload: {
  sub: string;
  email: string;
  role: UserRole;
}) {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(accessSecret());
}

export async function verifyAccessToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, accessSecret());
    return {
      userId: payload.sub as string,
      email: payload.email as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = cookies().get("access_token")?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

export function canEditCars(role: UserRole) {
  return role === "SUPERADMIN" || role === "MANAGER";
}

export function canDeleteCars(role: UserRole) {
  return role === "SUPERADMIN";
}

export function canManagePromotions(role: UserRole) {
  return role === "SUPERADMIN" || role === "MANAGER";
}

export function canManageSettings(role: UserRole) {
  return role === "SUPERADMIN";
}

export function canManageUsers(role: UserRole) {
  return role === "SUPERADMIN";
}

export function canViewLeads(role: UserRole) {
  return role === "SUPERADMIN" || role === "MANAGER" || role === "OPERATOR";
}
