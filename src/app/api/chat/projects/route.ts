import { NextResponse } from "next/server";
import { apiError } from "@/features/chat/api/server/api-response";
import {
  mutateChatDb,
  readChatDb,
  toApiData,
  toProjectSummaries,
} from "@/features/chat/api/server/chat-db";
import { createProject } from "@/features/chat/api/server/chat-domain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await readChatDb();

    return NextResponse.json({ projects: toProjectSummaries(db.projects) });
  } catch (error) {
    return apiError(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string };

    const { db, result } = await mutateChatDb((draft) =>
      createProject(draft, body.name ?? ""),
    );

    return NextResponse.json({ ...toApiData(db), project: result });
  } catch (error) {
    return apiError(error);
  }
}
