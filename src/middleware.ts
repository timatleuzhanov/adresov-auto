import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const enc = new TextEncoder();
const secret = () => enc.encode(process.env.JWT_ACCESS_SECRET || "dev-access-insecure-32chars-min");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  if (pathname === "/admin" || pathname === "/admin/") {
    const token = req.cookies.get("access_token")?.value;
    const url = req.nextUrl.clone();
    url.pathname = token ? "/admin/dashboard" : "/admin/login";
    return NextResponse.redirect(url);
  }

  const token = req.cookies.get("access_token")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  try {
    await jwtVerify(token, secret());
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
