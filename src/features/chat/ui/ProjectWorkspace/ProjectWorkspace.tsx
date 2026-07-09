"use client";

import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import { projectTabs } from "../../model/chat.mock";
import { useChat } from "../../model/ChatProvider";
import type { ProjectSource, ProjectTabId } from "../../model/chat.types";
import { ChatHeader } from "../ChatHeader/ChatHeader";
import { ChatList } from "../ChatList/ChatList";
import { PromptInput } from "../PromptInput/PromptInput";
import { Tabs } from "../Tabs/Tabs";

const sourceToneClassName: Record<ProjectSource["tone"], string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
};

export function ProjectWorkspace() {
  const { activeProject, projectTab, selectChat, setProjectTab } = useChat();

  if (!activeProject) {
    return null;
  }

  return (
    <div className="relative z-10 flex h-full w-full flex-col gap-6">
      <ChatHeader title={activeProject.name} />
      <PromptInput />
      <Tabs
        items={projectTabs}
        onSelect={(tabId) => setProjectTab(tabId as ProjectTabId)}
        selected={projectTab}
      />

      {projectTab === "chat" ? (
        <ProjectChatPanel
          onChatSelect={(chatId) => selectChat(chatId, activeProject.id)}
        />
      ) : null}
      {projectTab === "sources" ? <SourcesPanel /> : null}
      {projectTab === "system-prompt" ? (
        <SystemPromptPanel key={activeProject.id} />
      ) : null}
    </div>
  );
}

function ProjectChatPanel({
  onChatSelect,
}: {
  onChatSelect: (chatId: string) => void;
}) {
  const { activeProject, setChatModel } = useChat();

  if (!activeProject) {
    return null;
  }

  if (activeProject.chats.length === 0) {
    return (
      <div className="flex flex-1 items-start justify-center pt-4 text-center">
        <div>
          <p className="text-xs leading-4 text-uploy-primary">
            There are no chats yet
          </p>
          <p className="text-[11px] leading-[14px] text-uploy-secondary">
            Your {activeProject.name} chats will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChatList
      chats={activeProject.chats}
      onChatModelSelect={(chatId, model) =>
        setChatModel(chatId, model, activeProject.id)
      }
      onChatSelect={onChatSelect}
    />
  );
}

function SourcesPanel() {
  const {
    activeProject,
    addSourcesToActiveProject,
    removeSourceFromActiveProject,
  } = useChat();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!activeProject) {
    return null;
  }

  function handleSourceChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    addSourcesToActiveProject(selectedFiles);
    event.target.value = "";
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        className="hidden"
        multiple
        onChange={handleSourceChange}
        ref={fileInputRef}
        type="file"
      />
      <button
        className="flex w-fit items-center gap-2 rounded-lg px-2 py-1 text-xs leading-4 text-uploy-primary transition hover:bg-uploy-surface"
        onClick={() => fileInputRef.current?.click()}
        type="button"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-uploy-surface text-uploy-secondary">
          <Plus aria-hidden="true" size={15} strokeWidth={1.7} />
        </span>
        Add sources
      </button>

      <div className="flex flex-col gap-2">
        {activeProject.sources.map((source) => (
          <div
            className="group flex max-w-[420px] items-center justify-between gap-4 rounded-lg px-2 py-2 transition hover:bg-uploy-surface"
            key={source.id}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={[
                  "flex size-9 shrink-0 items-center justify-center rounded text-white",
                  sourceToneClassName[source.tone],
                ].join(" ")}
              >
                <FileText aria-hidden="true" size={16} strokeWidth={1.7} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs leading-4 text-uploy-primary">
                  {source.name}
                </p>
                <p className="text-[11px] leading-[14px] text-uploy-secondary">
                  {source.fileType} · {source.uploadedAtLabel}
                </p>
              </div>
            </div>
            <button
              aria-label={`Remove ${source.name}`}
              className="flex size-7 shrink-0 items-center justify-center rounded text-uploy-secondary opacity-0 transition hover:bg-uploy-line hover:text-uploy-primary group-hover:opacity-100"
              onClick={() => removeSourceFromActiveProject(source.id)}
              type="button"
            >
              <Trash2 aria-hidden="true" size={14} strokeWidth={1.7} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemPromptPanel() {
  const { activeProject, saveSystemPrompt } = useChat();
  const [isEditing, setIsEditing] = useState(!activeProject?.systemPrompt);
  const [draft, setDraft] = useState(activeProject?.systemPrompt ?? "");

  if (!activeProject) {
    return null;
  }

  const hasSavedPrompt = activeProject.systemPrompt.trim().length > 0;
  const canSavePrompt = draft.trim().length > 0;

  if (!isEditing && hasSavedPrompt) {
    return (
      <div className="relative rounded-lg bg-uploy-tertiary p-4 pr-12 text-xs leading-5 text-uploy-primary">
        <p>{activeProject.systemPrompt}</p>
        <button
          aria-label="Edit system prompt"
          className="absolute -bottom-7 right-4 flex size-6 items-center justify-center rounded text-uploy-primary transition hover:text-white/50 cursor-pointer"
          onClick={() => {
            setDraft(activeProject.systemPrompt);
            setIsEditing(true);
          }}
          type="button"
        >
          <Pencil aria-hidden="true" size={14} strokeWidth={1.7} />
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex min-h-32 flex-col rounded-lg bg-uploy-tertiary p-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSavePrompt) {
          return;
        }

        saveSystemPrompt(draft);
        setIsEditing(false);
      }}
    >
      <textarea
        className="min-h-24 resize-none bg-transparent text-xs leading-5 text-uploy-primary outline-none placeholder:text-uploy-muted"
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Write your instructions here"
        value={draft}
      />
      <div className="flex items-center justify-end gap-3">
        {hasSavedPrompt ? (
          <button
            className="rounded-full px-3 py-1.5 text-xs leading-4 text-uploy-primary transition hover:bg-uploy-line"
            onClick={() => {
              setDraft(activeProject.systemPrompt);
              setIsEditing(false);
            }}
            type="button"
          >
            Cancelar
          </button>
        ) : null}
        <button
          className="rounded-full bg-[linear-gradient(139deg,rgba(124,92,252,.8)_30%,rgba(168,156,255,.8)_75%,rgba(88,184,200,.8)_95%)] px-4 py-1.5 text-xs leading-4 text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!canSavePrompt}
          type="submit"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
