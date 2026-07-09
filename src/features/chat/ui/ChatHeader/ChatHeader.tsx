"use client";

import { IconButton } from "@/shared/ui/IconButton/IconButton";
import { Folder } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChat } from "../../model/ChatProvider";

type ChatHeaderProps = {
  title: string;
};

export function ChatHeader({ title }: ChatHeaderProps) {
  const { modelOptions, selectedModel, setSelectedModel } = useChat();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState<"top" | "bottom">("bottom");
  const menuRef = useRef<HTMLDivElement>(null);

  function getMenuPlacement() {
    const rect = menuRef.current?.getBoundingClientRect();

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
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Folder
          aria-hidden="true"
          className="text-uploy-primary"
          size={24}
          strokeWidth={1.7}
        />
        <h1 className="text-xl font-semibold leading-6">{title}</h1>
      </div>

      <div className="relative" ref={menuRef}>
        <IconButton
          icon="more"
          label="Select project model"
          onClick={() =>
            setIsMenuOpen((open) => {
              if (!open) {
                setMenuPlacement(getMenuPlacement());
              }

              return !open;
            })
          }
        />
        {isMenuOpen ? (
          <div
            className={[
              "absolute right-0 z-20 max-h-[160px] w-[212px] overflow-y-auto rounded-lg border border-uploy-line bg-uploy-surface p-1 shadow-2xl",
              menuPlacement === "bottom" ? "top-8" : "bottom-8",
            ].join(" ")}
          >
            {modelOptions.map((option) => {
              const isSelected = option === selectedModel;

              return (
                <button
                  className={[
                    "flex h-9 w-full items-center rounded px-3 text-left text-xs leading-4 transition hover:bg-uploy-focus hover:text-uploy-primary",
                    isSelected ? "text-uploy-primary" : "text-uploy-secondary",
                  ].join(" ")}
                  key={option}
                  onClick={() => {
                    setSelectedModel(option);
                    setIsMenuOpen(false);
                  }}
                  type="button"
                >
                  {option}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </header>
  );
}
