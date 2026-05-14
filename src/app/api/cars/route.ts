import { NextResponse } from "next/server";
import { parseCatalogSearchParams, queryCars } from "@/lib/car-query";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = parseCatalogSearchParams(searchParams);
  const data = await queryCars(q);
  return NextResponse.json(data);
}
