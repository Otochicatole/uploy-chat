import { NextResponse } from "next/server";
import { apiError } from "@/features/chat/api/server/api-response";
import { mutateChatDb, toApiData } from "@/features/chat/api/server/chat-db";
import { editUserMessage } from "@/features/chat/api/server/chat-domain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type MessageRouteContext = {
  params: Promise<{
    messageId: string;
  }>;
};

export async function PATCH(request: Request, { params }: MessageRouteContext) {
  try {
    const [{ messageId }, body] = await Promise.all([
      params,
      request.json() as Promise<{ content?: string }>,
    ]);

    const { db, result } = await mutateChatDb((draft) =>
      editUserMessage(draft, messageId, body.content ?? ""),
    );

    return NextResponse.json({ ...toApiData(db), thread: result });
  } catch (error) {
    return apiError(error);
  }
}
