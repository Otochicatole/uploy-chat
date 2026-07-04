"use client";

import { useChat } from "../../model/ChatProvider";
import { ConversationWorkspace } from "../ConversationWorkspace/ConversationWorkspace";
import { ProjectWorkspace } from "../ProjectWorkspace/ProjectWorkspace";
import { PromptInput } from "../PromptInput/PromptInput";

export function ChatWorkspace() {
  const { activeProject, activeThread, mode } = useChat();

  return (
    <section className="relative h-screen min-h-[720px] overflow-hidden px-6 py-8">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 z-10 w-px bg-uploy-line"
      />
      <span
        aria-hidden="true"
        className="absolute inset-y-0 right-0 z-10 w-px bg-uploy-line"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/uploy/main-content-bg.png')] bg-cover bg-center opacity-100"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-uploy-bg/95" />

      {mode === "project" && activeProject ? <ProjectWorkspace /> : null}
      {mode === "conversation" && activeThread ? (
        <ConversationWorkspace />
      ) : null}
      {mode === "home" ? <HomeWorkspace /> : null}
    </section>
  );
}

function HomeWorkspace() {
  return (
    <div className="relative z-10 flex h-full w-full flex-col justify-end gap-24">
      <div className="text-center">
        <h1 className="text-[32px] font-bold leading-10 tracking-normal text-white">
          How can we{" "}
          <span className="bg-[linear-gradient(178deg,#7c5cfc_30%,#a89cff_75%,#58b8c8_95%)] bg-clip-text text-transparent">
            assist you today?
          </span>
        </h1>
      </div>

      <PromptInput />
    </div>
  );
}
