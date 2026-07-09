import { ChatPage } from "@/features/chat";

type ProjectSystemPromptRoutePageProps = {
  params: Promise<{
    projectId: string;
  }>;
  searchParams: Promise<{
    model?: string;
  }>;
};

export default async function ProjectSystemPromptRoutePage({
  params,
  searchParams,
}: ProjectSystemPromptRoutePageProps) {
  const [{ projectId }, { model }] = await Promise.all([params, searchParams]);

  return (
    <ChatPage
      initialRoute={{
        mode: "project",
        activeProjectId: projectId,
        projectTab: "system-prompt",
        selectedModel: model ?? null,
      }}
    />
  );
}
