import { ChatPage } from "@/features/chat";

type ProjectChatRoutePageProps = {
  params: Promise<{
    projectId: string;
    chatId: string;
  }>;
  searchParams: Promise<{
    model?: string;
  }>;
};

export default async function ProjectChatRoutePage({
  params,
  searchParams,
}: ProjectChatRoutePageProps) {
  const [{ projectId, chatId }, { model }] = await Promise.all([
    params,
    searchParams,
  ]);

  return (
    <ChatPage
      initialRoute={{
        mode: "conversation",
        activeProjectId: projectId,
        activeChatId: chatId,
        selectedModel: model ?? null,
      }}
    />
  );
}
