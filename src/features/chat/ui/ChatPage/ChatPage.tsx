import { ChatProvider } from "../../model/ChatProvider";
import { ChatWorkspace } from "../ChatWorkspace/ChatWorkspace";
import { Sidebar } from "../Sidebar/Sidebar";

export function ChatPage() {
  return (
    <ChatProvider>
      <main className="min-h-screen overflow-hidden bg-uploy-bg text-uploy-primary">
        <div className="grid min-h-screen grid-cols-[260px_minmax(0,1fr)]">
          <Sidebar />
          <ChatWorkspace />
        </div>
      </main>
    </ChatProvider>
  );
}
