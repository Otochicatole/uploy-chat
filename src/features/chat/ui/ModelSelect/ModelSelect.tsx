"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChat } from "../../model/ChatProvider";
import { modelOptions } from "../../model/chat.mock";

type ModelSelectProps = {
  label: string;
};

export function ModelSelect({ label }: ModelSelectProps) {
  const { selectedModel, setSelectedModel } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<"top" | "bottom">("top");
  const containerRef = useRef<HTMLDivElement>(null);

  function getMenuPlacement() {
    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect) {
      return "top";
    }

    const menuHeight = modelOptions.length * 40 + 8;
    const gap = 8;
    const hasRoomAbove = rect.top >= menuHeight + gap;

    return hasRoomAbove ? "top" : "bottom";
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  const ChevronIcon = isOpen ? ChevronUp : ChevronDown;

  return (
    <div className="relative hidden sm:block" ref={containerRef}>
      {isOpen ? (
        <div
          className={[
            "absolute right-0 z-20 max-h-[180px] w-60 overflow-y-auto rounded-lg border border-uploy-line bg-uploy-surface p-1 shadow-2xl",
            placement === "top"
              ? "bottom-[calc(100%+8px)]"
              : "top-[calc(100%+8px)]",
          ].join(" ")}
        >
          {modelOptions.map((option, index) => (
            <button
              className="flex h-10 w-full items-center rounded px-3 text-left text-xs leading-4 text-uploy-secondary transition hover:bg-uploy-focus hover:text-uploy-primary"
              key={`${option}-${index}`}
              onClick={() => {
                setSelectedModel(option);
                setIsOpen(false);
              }}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}

      <button
        aria-expanded={isOpen}
        className="flex h-7 items-center gap-2 rounded-lg px-3 text-xs leading-4 text-uploy-primary transition hover:bg-uploy-line"
        onClick={() =>
          setIsOpen((open) => {
            if (!open) {
              setPlacement(getMenuPlacement());
            }

            return !open;
          })
        }
        type="button"
      >
        {selectedModel || label}
        <ChevronIcon aria-hidden="true" size={15} strokeWidth={1.7} />
      </button>
    </div>
  );
}
