import { ChatPage } from "@/features/chat";

type ProjectSourcesRoutePageProps = {
  params: Promise<{
    projectId: string;
  }>;
  searchParams: Promise<{
    model?: string;
  }>;
};

export default async function ProjectSourcesRoutePage({
  params,
  searchParams,
}: ProjectSourcesRoutePageProps) {
  const [{ projectId }, { model }] = await Promise.all([params, searchParams]);

  return (
    <ChatPage
      initialRoute={{
        mode: "project",
        activeProjectId: projectId,
        projectTab: "sources",
        selectedModel: model ?? null,
      }}
    />
  );
}
