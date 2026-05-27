import { NextResponse } from "next/server";
import { getDashboardPayload } from "@/lib/prototype-data";

export async function GET() {
  return NextResponse.json(getDashboardPayload());
}
