"use client";

import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChat } from "../../model/ChatProvider";
import type { ChatThread } from "../../model/chat.types";

type ChatRowProps = {
  chat: ChatThread;
  onModelSelect?: (model: string) => void;
  onSelect?: () => void;
  withDivider?: boolean;
};

export function ChatRow({
  chat,
  onModelSelect,
  onSelect,
  withDivider,
}: ChatRowProps) {
  const { modelOptions } = useChat();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState<"top" | "bottom">("bottom");
  const actionRef = useRef<HTMLDivElement>(null);

  function getMenuPlacement() {
    const rect = actionRef.current?.getBoundingClientRect();

    if (!rect) {
      return "bottom";
    }

    const menuHeight = modelOptions.length * 36 + 8;
    const gap = 8;
    const hasRoomBelow = window.innerHeight - rect.bottom >= menuHeight + gap;
    const hasRoomAbove = rect.top >= menuHeight + gap;

    return hasRoomBelow || !hasRoomAbove ? "bottom" : "top";
  }

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!actionRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isMenuOpen]);

  return (
    <div
      className={[
        withDivider ? "border-t border-uploy-line" : "",
        "group relative flex min-h-[53px] w-full items-start gap-4 px-2 py-3 text-left transition hover:bg-uploy-surface",
      ].join(" ")}
    >
      <button className="min-w-0 flex-1 text-left" onClick={onSelect} type="button">
        <h2 className="truncate text-xs leading-4 text-uploy-primary">
          {chat.title}
        </h2>
        <p className="truncate text-[11px] leading-[14px] text-uploy-secondary">
          {chat.preview}
        </p>
      </button>

      <div className="relative flex h-6 w-14 shrink-0 justify-end" ref={actionRef}>
        <span
          className={[
            "pt-0.5 text-[11px] leading-[14px] text-uploy-muted transition",
            isMenuOpen ? "opacity-0" : "opacity-100 group-hover:opacity-0",
          ].join(" ")}
        >
          {chat.updatedAtLabel ?? "Ahora"}
        </span>

        {onModelSelect ? (
          <button
            aria-expanded={isMenuOpen}
            aria-label={`Select model for ${chat.title}`}
            className={[
              "absolute right-0 top-0 flex size-6 items-center justify-center rounded text-uploy-primary transition hover:bg-uploy-line",
              isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            ].join(" ")}
            onClick={() =>
              setIsMenuOpen((open) => {
                if (!open) {
                  setMenuPlacement(getMenuPlacement());
                }

                return !open;
              })
            }
            type="button"
          >
            <MoreHorizontal aria-hidden="true" size={16} strokeWidth={1.7} />
          </button>
        ) : null}

        {isMenuOpen && onModelSelect ? (
          <div
            className={[
              "absolute right-0 z-20 max-h-[160px] w-[212px] overflow-y-auto rounded-lg border border-uploy-line bg-uploy-surface p-1 shadow-2xl",
              menuPlacement === "bottom" ? "top-8" : "bottom-8",
            ].join(" ")}
          >
            {modelOptions.map((model) => {
              const isSelected = model === chat.selectedModel;

              return (
                <button
                  className={[
                    "flex h-9 w-full items-center rounded px-3 text-left text-xs leading-4 transition hover:bg-uploy-focus hover:text-uploy-primary",
                    isSelected
                      ? "text-uploy-primary"
                      : "text-uploy-secondary",
                  ].join(" ")}
                  key={model}
                  onClick={() => {
                    onModelSelect(model);
                    setIsMenuOpen(false);
                  }}
                  type="button"
                >
                  {model}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
