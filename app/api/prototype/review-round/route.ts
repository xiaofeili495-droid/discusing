import { NextRequest, NextResponse } from "next/server";
import { buildReviewRoundResponse, type ReviewRoundRequest } from "@/lib/prototype-data";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as ReviewRoundRequest | null;

  if (!body) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const response = buildReviewRoundResponse(body);
  return NextResponse.json(response);
}
