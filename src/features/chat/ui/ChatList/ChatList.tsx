import type { ChatThread } from "../../model/chat.types";
import { ChatRow } from "../ChatRow/ChatRow";

type ChatListProps = {
  chats: ChatThread[];
  onChatSelect?: (chatId: string) => void;
};

export function ChatList({ chats, onChatSelect }: ChatListProps) {
  return (
    <div className="flex flex-col">
      {chats.map((chat, index) => (
        <ChatRow
          chat={chat}
          key={chat.id}
          onSelect={() => onChatSelect?.(chat.id)}
          withDivider={index > 0}
        />
      ))}
    </div>
  );
}
