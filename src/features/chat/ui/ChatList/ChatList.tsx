import type { ChatThread } from "../../model/chat.types";
import { ChatRow } from "../ChatRow/ChatRow";

type ChatListProps = {
  chats: ChatThread[];
  onChatModelSelect?: (chatId: string, model: string) => void;
  onChatSelect?: (chatId: string) => void;
};

export function ChatList({
  chats,
  onChatModelSelect,
  onChatSelect,
}: ChatListProps) {
  return (
    <div className="flex flex-col">
      {chats.map((chat, index) => (
        <ChatRow
          chat={chat}
          key={chat.id}
          onModelSelect={
            onChatModelSelect
              ? (model) => onChatModelSelect(chat.id, model)
              : undefined
          }
          onSelect={() => onChatSelect?.(chat.id)}
          withDivider={index > 0}
        />
      ))}
    </div>
  );
}
