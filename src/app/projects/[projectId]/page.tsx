import { ChatPage } from "@/features/chat";

type ProjectRoutePageProps = {
  params: Promise<{
    projectId: string;
  }>;
  searchParams: Promise<{
    model?: string;
  }>;
};

export default async function ProjectRoutePage({
  params,
  searchParams,
}: ProjectRoutePageProps) {
  const [{ projectId }, { model }] = await Promise.all([params, searchParams]);

  return (
    <ChatPage
      initialRoute={{
        mode: "project",
        activeProjectId: projectId,
        projectTab: "chat",
        selectedModel: model ?? null,
      }}
    />
  );
}
