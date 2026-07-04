"use client";

import { IconButton } from "@/shared/ui/IconButton/IconButton";
import { Folder } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ChatHeaderProps = {
  title: string;
};

export function ChatHeader({ title }: ChatHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
          label="Project actions"
          onClick={() => setIsMenuOpen((open) => !open)}
        />
        {isMenuOpen ? (
          <div className="absolute right-0 top-8 z-20 w-[212px] rounded-lg border border-uploy-line bg-uploy-surface p-1 shadow-2xl">
            {["Lorem ipsum", "Lorem ipsum", "Lorem ipsum", "Lorem ipsum"].map(
              (option, index) => (
                <button
                  className="flex h-8 w-full items-center rounded px-2 text-left text-xs leading-4 text-uploy-secondary transition hover:bg-uploy-focus hover:text-uploy-primary"
                  key={`${option}-${index}`}
                  onClick={() => setIsMenuOpen(false)}
                  type="button"
                >
                  {option}
                </button>
              ),
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
