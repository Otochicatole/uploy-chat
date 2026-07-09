import { NextResponse } from "next/server";
import { apiError } from "@/features/chat/api/server/api-response";
import { readChatDb } from "@/features/chat/api/server/chat-db";
import { findThreadById } from "@/features/chat/api/server/chat-domain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ChatRouteContext = {
  params: Promise<{
    chatId: string;
  }>;
};

export async function GET(request: Request, { params }: ChatRouteContext) {
  try {
    const { chatId } = await params;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const db = await readChatDb();
    const threadContext = findThreadById(db, chatId, projectId);

    if (!threadContext) {
      return apiError(new Error("Chat not found"), 404);
    }

    return NextResponse.json(threadContext);
  } catch (error) {
    return apiError(error, 500);
  }
}
