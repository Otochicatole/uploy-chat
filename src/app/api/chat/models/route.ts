import { NextResponse } from "next/server";
import { apiError } from "@/features/chat/api/server/api-response";
import { mutateChatDb, readChatDb, toApiData } from "@/features/chat/api/server/chat-db";
import { setSelectedModel } from "@/features/chat/api/server/chat-domain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await readChatDb();

    return NextResponse.json({
      defaultModel: db.defaultModel,
      modelOptions: db.modelOptions,
      selectedModel: db.selectedModel,
    });
  } catch (error) {
    return apiError(error, 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      chatId?: string | null;
      model?: string;
      projectId?: string | null;
    };

    if (!body.model) {
      return apiError(new Error("Model is required"));
    }

    const { db } = await mutateChatDb((draft) => {
      setSelectedModel(draft, body.model!, body.chatId, body.projectId);
    });

    return NextResponse.json(toApiData(db));
  } catch (error) {
    return apiError(error);
  }
}
