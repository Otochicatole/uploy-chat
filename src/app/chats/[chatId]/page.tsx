import { ChatPage } from "@/features/chat";

type ChatRoutePageProps = {
  params: Promise<{
    chatId: string;
  }>;
  searchParams: Promise<{
    model?: string;
  }>;
};

export default async function ChatRoutePage({
  params,
  searchParams,
}: ChatRoutePageProps) {
  const [{ chatId }, { model }] = await Promise.all([params, searchParams]);

  return (
    <ChatPage
      initialRoute={{
        mode: "conversation",
        activeChatId: chatId,
        activeProjectId: null,
        selectedModel: model ?? null,
      }}
    />
  );
}
