import { NextResponse } from "next/server";
import { apiError } from "@/features/chat/api/server/api-response";
import { mutateChatDb, readChatDb, toApiData } from "@/features/chat/api/server/chat-db";
import {
  findProjectById,
  updateProjectPrompt,
} from "@/features/chat/api/server/chat-domain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ProjectRouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function GET(_request: Request, { params }: ProjectRouteContext) {
  try {
    const { projectId } = await params;
    const db = await readChatDb();
    const project = findProjectById(db, projectId);

    if (!project) {
      return apiError(new Error("Project not found"), 404);
    }

    return NextResponse.json({ project });
  } catch (error) {
    return apiError(error, 500);
  }
}

export async function PATCH(request: Request, { params }: ProjectRouteContext) {
  try {
    const [{ projectId }, body] = await Promise.all([
      params,
      request.json() as Promise<{ systemPrompt?: string }>,
    ]);

    const { db, result } = await mutateChatDb((draft) =>
      updateProjectPrompt(draft, projectId, body.systemPrompt ?? ""),
    );

    return NextResponse.json({ ...toApiData(db), project: result });
  } catch (error) {
    return apiError(error);
  }
}
