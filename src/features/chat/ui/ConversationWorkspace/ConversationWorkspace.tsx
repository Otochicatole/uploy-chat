"use client";

import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  CornerDownRight,
  Pencil,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useChat } from "../../model/ChatProvider";
import type { ChatMessage } from "../../model/chat.types";
import { PromptInput } from "../PromptInput/PromptInput";

export function ConversationWorkspace() {
  const { activeThread, editUserMessage } = useChat();
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const editingMessage = useMemo(
    () =>
      activeThread?.messages.find(
        (message) => message.id === editingMessageId,
      ) ?? null,
    [activeThread?.messages, editingMessageId],
  );

  if (!activeThread) {
    return null;
  }

  return (
    <div className="relative z-10 flex h-full flex-col gap-6">
      <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-1 py-4">
        {editingMessage ? (
          <EditMessageCard
            draft={draft}
            onCancel={() => setEditingMessageId(null)}
            onChange={setDraft}
            onSubmit={() => {
              editUserMessage(editingMessage.id, draft);
              setEditingMessageId(null);
            }}
          />
        ) : null}

        {activeThread.messages.map((message) => {
          if (message.id === editingMessageId) {
            return null;
          }

          if (message.role === "user") {
            return (
              <UserMessage
                key={message.id}
                message={message}
                onEdit={() => {
                  setDraft(message.content ?? "");
                  setEditingMessageId(message.id);
                }}
              />
            );
          }

          return <AssistantMessage key={message.id} message={message} />;
        })}
      </div>

      <PromptInput />
    </div>
  );
}

function EditMessageCard({
  draft,
  onCancel,
  onChange,
  onSubmit,
}: {
  draft: string;
  onCancel: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="rounded-lg bg-uploy-tertiary p-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <textarea
        autoFocus
        className="min-h-12 w-full resize-none bg-transparent text-sm leading-5 text-uploy-primary outline-none"
        onChange={(event) => onChange(event.target.value)}
        value={draft}
      />
      <div className="flex items-center justify-end gap-3">
        <button
          className="rounded-full px-3 py-1.5 text-xs leading-4 text-uploy-primary transition hover:bg-uploy-line"
          onClick={onCancel}
          type="button"
        >
          Cancelar
        </button>
        <button
          className="rounded-full bg-[linear-gradient(139deg,rgba(124,92,252,.85)_30%,rgba(168,156,255,.85)_75%,rgba(88,184,200,.85)_95%)] px-4 py-1.5 text-xs leading-4 text-white transition hover:brightness-110"
          type="submit"
        >
          Enviar
        </button>
      </div>
    </form>
  );
}

function UserMessage({
  message,
  onEdit,
}: {
  message: ChatMessage;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="max-w-[70%] rounded-full bg-uploy-tertiary px-4 py-2 text-xs leading-4 text-uploy-primary">
        {message.content}
      </div>
      {message.attachments?.length ? (
        <div className="flex max-w-[70%] flex-wrap justify-end gap-2">
          {message.attachments.map((attachment) => (
            <span
              className="rounded-lg border border-uploy-line bg-uploy-surface px-3 py-1.5 text-[11px] leading-[14px] text-uploy-secondary"
              key={attachment.id}
            >
              {attachment.name}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mr-2 flex items-center gap-2 text-uploy-secondary">
        <MessageAction icon={<Copy size={14} strokeWidth={1.7} />} label="Copy" />
        <MessageAction
          icon={<Pencil size={14} strokeWidth={1.7} />}
          label="Edit message"
          onClick={onEdit}
        />
      </div>
    </div>
  );
}

function AssistantMessage({ message }: { message: ChatMessage }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (message.status === "loading") {
    return (
      <div className="flex min-h-24 items-start">
        <span className="mt-3 size-4 rounded-full bg-[linear-gradient(139deg,#7c5cfc_30%,#a89cff_75%,#58b8c8_95%)] shadow-[0_0_18px_rgba(124,92,252,.55)] animate-pulse" />
      </div>
    );
  }

  const blocks = message.blocks ?? [];
  const visibleBlocks = isExpanded ? blocks : blocks.slice(0, 1);
  const hasMultipleBlocks = blocks.length > 1;
  const ThoughtIcon = isExpanded ? ChevronUp : ChevronDown;

  return (
    <div className="max-w-[96%] text-xs leading-5 text-uploy-primary">
      <div className="flex flex-col gap-4">
        {visibleBlocks.map((block, index) => (
          <p key={`${message.id}-${index}`}>{block}</p>
        ))}
      </div>

      <button
        className="mt-4 flex items-center gap-2 text-[11px] leading-[14px] text-uploy-secondary transition hover:text-uploy-primary"
        disabled={!hasMultipleBlocks}
        onClick={() => hasMultipleBlocks && setIsExpanded((expanded) => !expanded)}
        type="button"
      >
        {message.createdAtLabel}
        {hasMultipleBlocks ? (
          <ThoughtIcon aria-hidden="true" size={13} strokeWidth={1.7} />
        ) : (
          <ChevronDown aria-hidden="true" size={13} strokeWidth={1.7} />
        )}
      </button>

      <div className="mt-3 flex items-center gap-3 text-uploy-secondary">
        <MessageAction icon={<Copy size={14} strokeWidth={1.7} />} label="Copy" />
        <MessageAction
          icon={<Pencil size={14} strokeWidth={1.7} />}
          label="Edit response"
        />
        <MessageAction
          icon={<CornerDownRight size={14} strokeWidth={1.7} />}
          label="Branch"
        />
      </div>
    </div>
  );
}

function MessageAction({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  const [hasCopied, setHasCopied] = useState(false);
  const isCopy = label === "Copy";

  return (
    <button
      aria-label={label}
      className="flex size-5 items-center justify-center rounded text-uploy-secondary transition hover:bg-uploy-surface hover:text-uploy-primary"
      onClick={() => {
        onClick?.();

        if (isCopy) {
          setHasCopied(true);
          window.setTimeout(() => setHasCopied(false), 900);
        }
      }}
      type="button"
    >
      {isCopy && hasCopied ? (
        <Check aria-hidden="true" size={14} strokeWidth={1.7} />
      ) : (
        icon
      )}
    </button>
  );
}
