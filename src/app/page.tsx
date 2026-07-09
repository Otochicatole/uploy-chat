import { ChatPage } from "@/features/chat";

type HomeProps = {
  searchParams: Promise<{
    model?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { model } = await searchParams;

  return (
    <ChatPage
      initialRoute={{
        mode: "home",
        selectedModel: model ?? null,
      }}
    />
  );
}
