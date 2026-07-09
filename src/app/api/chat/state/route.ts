import { NextResponse } from "next/server";
import { readChatDb, toApiData } from "@/features/chat/api/server/chat-db";
import { apiError } from "@/features/chat/api/server/api-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await readChatDb();

    return NextResponse.json(toApiData(db));
  } catch (error) {
    return apiError(error, 500);
  }
}
