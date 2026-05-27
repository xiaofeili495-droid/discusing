import { NextRequest, NextResponse } from "next/server";
import { buildGeneratedRoles, getRoomPayload } from "@/lib/prototype-data";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const fileName = typeof body.fileName === "string" ? body.fileName : "会议纪要";
  const room = getRoomPayload();

  return NextResponse.json({
    fileName,
    speakers: room.speakers,
    transcriptSegments: room.transcriptSegments,
    generatedRoles: buildGeneratedRoles(),
  });
}
