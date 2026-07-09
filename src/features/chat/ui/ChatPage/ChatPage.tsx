import { ChatProvider } from "../../model/ChatProvider";
import type { ChatRouteState } from "../../model/chat.types";
import { ChatWorkspace } from "../ChatWorkspace/ChatWorkspace";
import { Sidebar } from "../Sidebar/Sidebar";

type ChatPageProps = {
  initialRoute?: ChatRouteState;
};

export function ChatPage({ initialRoute }: ChatPageProps) {
  return (
    <ChatProvider initialRoute={initialRoute}>
      <main className="min-h-screen overflow-hidden bg-uploy-bg text-uploy-primary">
        <div className="grid min-h-screen grid-cols-[260px_minmax(0,1fr)]">
          <Sidebar />
          <ChatWorkspace />
        </div>
      </main>
    </ChatProvider>
  );
}
