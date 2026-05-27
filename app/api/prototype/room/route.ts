import { NextResponse } from "next/server";
import { getRoomPayload } from "@/lib/prototype-data";

export async function GET() {
  return NextResponse.json(getRoomPayload());
}
