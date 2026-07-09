import { NextResponse } from "next/server";
import { apiError } from "@/features/chat/api/server/api-response";
import { mutateChatDb, toApiData } from "@/features/chat/api/server/chat-db";
import {
  sendMessage,
  type SendMessagePayload,
} from "@/features/chat/api/server/chat-domain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SendMessagePayload;

    const { db, result } = await mutateChatDb((draft) =>
      sendMessage(draft, body),
    );

    return NextResponse.json({ ...toApiData(db), ...result });
  } catch (error) {
    return apiError(error);
  }
}
