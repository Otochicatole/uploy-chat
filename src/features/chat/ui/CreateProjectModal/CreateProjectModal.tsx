"use client";

import { X } from "lucide-react";
import { useState } from "react";

type CreateProjectModalProps = {
  onClose: () => void;
  onCreate: (name: string) => void;
};

export function CreateProjectModal({
  onClose,
  onCreate,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const canCreate = name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <button
        aria-label="Close create project modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <form
        className="relative z-10 w-full max-w-[440px] rounded-lg bg-uploy-surface px-9 py-8 shadow-2xl"
        onSubmit={(event) => {
          event.preventDefault();

          if (!canCreate) {
            return;
          }

          onCreate(name.trim());
        }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-semibold leading-5 text-uploy-primary">
            Create project
          </h2>
          <button
            aria-label="Close create project modal"
            className="flex size-7 items-center justify-center rounded text-uploy-secondary transition hover:bg-uploy-line hover:text-uploy-primary"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={14} strokeWidth={1.7} />
          </button>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-[11px] leading-[14px] text-uploy-secondary">
            Name project
          </span>
          <input
            autoFocus
            className="h-9 rounded-md bg-uploy-tertiary px-3 text-xs leading-4 text-uploy-primary outline-none placeholder:text-uploy-muted focus:ring-1 focus:ring-uploy-accent"
            onChange={(event) => setName(event.target.value)}
            placeholder="Name project"
            value={name}
          />
        </label>

        <div className="mt-6 flex justify-end">
          <button
            className="rounded-full bg-[linear-gradient(139deg,rgba(124,92,252,.75)_30%,rgba(168,156,255,.75)_75%,rgba(88,184,200,.75)_95%)] px-4 py-2 text-xs leading-4 text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!canCreate}
            type="submit"
          >
            Create project
          </button>
        </div>
      </form>
    </div>
  );
}
