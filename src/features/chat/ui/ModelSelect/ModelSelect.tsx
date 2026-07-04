"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChat } from "../../model/ChatProvider";

type ModelSelectProps = {
  label: string;
};

const modelOptions = ["GPT-5.5", "Opus-3.5", "Gemini-3.5", "Qwen-3.7"];

export function ModelSelect({ label }: ModelSelectProps) {
  const { selectedModel, setSelectedModel } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
        <div className="absolute bottom-[calc(100%+8px)] right-0 z-20 w-60 rounded-lg border border-uploy-line bg-uploy-surface p-1 shadow-2xl">
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
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        {selectedModel || label}
        <ChevronIcon aria-hidden="true" size={15} strokeWidth={1.7} />
      </button>
    </div>
  );
}
