import { NextRequest, NextResponse } from "next/server";
import { buildExportContent, type ExportType, type Message, type Role, type Summary } from "@/lib/prototype-data";

type ExportRequestBody = {
  type?: ExportType;
  roomTitle?: string;
  roomTopic?: string;
  roles?: Role[];
  messages?: Message[];
  summary?: Summary;
  includeRoles?: boolean;
  includeSummary?: boolean;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as ExportRequestBody;

  const content = buildExportContent({
    type: body.type === "txt" ? "txt" : "markdown",
    roomTitle: body.roomTitle ?? "未命名评审室",
    roomTopic: body.roomTopic ?? "未设置主题",
    roles: body.roles ?? [],
    messages: body.messages ?? [],
    summary: body.summary ?? {
      consensus: "",
      disagreement: "",
      risks: "",
      next: "",
    },
    includeRoles: body.includeRoles ?? true,
    includeSummary: body.includeSummary ?? true,
  });

  return NextResponse.json({ content });
}
