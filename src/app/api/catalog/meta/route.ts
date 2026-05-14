import { NextResponse } from "next/server";
import { getCarAggregates, getDistinctBrands } from "@/lib/car-query";

export async function GET() {
  const [aggregates, brands] = await Promise.all([getCarAggregates(), getDistinctBrands()]);
  return NextResponse.json({ aggregates, brands });
}
