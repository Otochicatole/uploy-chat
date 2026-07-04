"use client";

import { IconButton } from "@/shared/ui/IconButton/IconButton";
import { FileText, Plus, Upload, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useChat } from "../../model/ChatProvider";
import { ModelSelect } from "../ModelSelect/ModelSelect";

export function PromptInput() {
  const { isResponding, sendMessage } = useChat();
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canSend = (message.trim().length > 0 || contextFiles.length > 0) && !isResponding;

  useEffect(() => {
    if (!isUploadMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!formRef.current?.contains(event.target as Node)) {
        setIsUploadMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isUploadMenuOpen]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    setContextFiles((currentFiles) => {
      const knownFiles = new Set(
        currentFiles.map(
          (file) => `${file.name}-${file.size}-${file.lastModified}`,
        ),
      );
      const newFiles = selectedFiles.filter((file) =>
        !knownFiles.has(`${file.name}-${file.size}-${file.lastModified}`),
      );

      return [...currentFiles, ...newFiles];
    });
    setIsUploadMenuOpen(false);

    event.target.value = "";
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function clearSelectedFiles() {
    setContextFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <form
      className="relative flex min-h-14 flex-col gap-3 rounded-lg bg-uploy-tertiary p-3"
      onSubmit={(event) => {
        event.preventDefault();

        if (!canSend) {
          return;
        }

        sendMessage({ content: message, files: contextFiles });
        setMessage("");
        clearSelectedFiles();
      }}
      ref={formRef}
    >
      {isUploadMenuOpen ? (
        <div className="absolute bottom-[calc(100%-2px)] left-3 z-20 w-[270px] rounded-lg border border-uploy-line bg-uploy-surface p-1 shadow-2xl">
          <button
            className="flex h-8 w-full items-center gap-2 rounded px-3 text-left text-xs leading-4 text-uploy-primary transition hover:bg-uploy-focus"
            onClick={handleUploadClick}
            type="button"
          >
            <Upload aria-hidden="true" size={15} strokeWidth={1.7} />
            Upload files
          </button>
        </div>
      ) : null}

      {contextFiles.length > 0 ? (
        <div className="flex max-w-full flex-wrap gap-2">
          {contextFiles.map((file) => {
            const fileKey = `${file.name}-${file.size}-${file.lastModified}`;

            return (
              <div
                className="flex max-w-full items-center gap-2 rounded-lg border border-uploy-line bg-uploy-surface px-3 py-2 text-xs leading-4 text-uploy-primary"
                key={fileKey}
              >
                <FileText
                  aria-hidden="true"
                  className="shrink-0 text-uploy-secondary"
                  size={16}
                  strokeWidth={1.7}
                />
                <span className="max-w-[260px] truncate">{file.name}</span>
                <button
                  aria-label={`Remove ${file.name} from context`}
                  className="ml-1 flex size-5 shrink-0 items-center justify-center rounded-full text-uploy-secondary transition hover:bg-uploy-line hover:text-uploy-primary"
                  onClick={() =>
                    setContextFiles((currentFiles) =>
                      currentFiles.filter(
                        (currentFile) =>
                          `${currentFile.name}-${currentFile.size}-${currentFile.lastModified}` !==
                          fileKey,
                      ),
                    )
                  }
                  type="button"
                >
                  <X aria-hidden="true" size={14} strokeWidth={1.7} />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      <input
        className="hidden"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            aria-label="Open upload menu"
            className="flex size-6 shrink-0 items-center justify-center rounded text-uploy-muted transition hover:text-uploy-primary focus-visible:bg-uploy-surface focus-visible:text-uploy-primary focus-visible:outline-none"
            onClick={() => setIsUploadMenuOpen((isOpen) => !isOpen)}
            type="button"
          >
            <Plus aria-hidden="true" size={16} strokeWidth={1.7} />
          </button>
          <input
            aria-label="Ask anything"
            className="min-w-0 flex-1 bg-transparent text-sm leading-5 text-uploy-primary outline-none placeholder:text-uploy-muted"
            onChange={(event) => setMessage(event.target.value)}
            onFocus={() => setIsUploadMenuOpen(false)}
            placeholder="Ask anything"
            type="text"
            value={message}
          />
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <ModelSelect label="Model" />
          <IconButton
            disabled={!canSend}
            icon="send"
            label="Send prompt"
            type="submit"
            variant="send"
          />
        </div>
      </div>
    </form>
  );
}
