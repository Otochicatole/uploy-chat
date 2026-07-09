import { NextResponse } from "next/server";
import { apiError } from "@/features/chat/api/server/api-response";
import { mutateChatDb, toApiData } from "@/features/chat/api/server/chat-db";
import {
  addProjectSources,
  removeProjectSource,
  type MockFilePayload,
} from "@/features/chat/api/server/chat-domain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ProjectSourcesRouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: ProjectSourcesRouteContext,
) {
  try {
    const [{ projectId }, body] = await Promise.all([
      params,
      request.json() as Promise<{ files?: MockFilePayload[] }>,
    ]);

    const { db, result } = await mutateChatDb((draft) =>
      addProjectSources(draft, projectId, body.files ?? []),
    );

    return NextResponse.json({ ...toApiData(db), project: result });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: ProjectSourcesRouteContext,
) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get("sourceId");

    if (!sourceId) {
      return apiError(new Error("sourceId is required"));
    }

    const { db, result } = await mutateChatDb((draft) =>
      removeProjectSource(draft, projectId, sourceId),
    );

    return NextResponse.json({ ...toApiData(db), project: result });
  } catch (error) {
    return apiError(error);
  }
}
