import type { ChatThread } from "../../model/chat.types";

type ChatRowProps = {
  chat: ChatThread;
  onSelect?: () => void;
  withDivider?: boolean;
};

export function ChatRow({ chat, onSelect, withDivider }: ChatRowProps) {
  return (
    <button
      className={[
        withDivider ? "border-t border-uploy-line" : "",
        "flex min-h-[53px] w-full items-start justify-between gap-4 px-2 py-3 text-left transition hover:bg-uploy-surface",
      ].join(" ")}
      onClick={onSelect}
      type="button"
    >
      <div className="min-w-0">
        <h2 className="truncate text-xs leading-4 text-uploy-primary">
          {chat.title}
        </h2>
        <p className="truncate text-[11px] leading-[14px] text-uploy-secondary">
          {chat.preview}
        </p>
      </div>

      <div className="shrink-0 text-[11px] leading-[14px] text-uploy-muted">
        {chat.updatedAtLabel ? (
          chat.updatedAtLabel
        ) : (
          <span aria-hidden="true" className="text-uploy-primary">
            ...
          </span>
        )}
      </div>
    </button>
  );
}
