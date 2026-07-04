"use client";

import { useChat } from "../../model/ChatProvider";
import { FolderPlus, SquarePen } from "lucide-react";
import { useState } from "react";
import { CreateProjectModal } from "../CreateProjectModal/CreateProjectModal";
import { SidebarGroup } from "../SidebarGroup/SidebarGroup";
import { SidebarItem } from "../SidebarItem/SidebarItem";

export function Sidebar() {
  const {
    activeChatId,
    activeProjectId,
    createProject,
    mode,
    projects,
    selectChat,
    selectProject,
    sidebarHistory,
    startNewChat,
  } = useChat();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  return (
    <>
      <aside className="h-screen bg-uploy-bg px-3 py-6">
        <nav aria-label="Uploy chat navigation" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <SidebarItem
              active={mode === "home"}
              icon={<SquarePen aria-hidden="true" size={16} strokeWidth={1.7} />}
              label="Nuevo chat"
              onClick={startNewChat}
            />
            <SidebarItem
              icon={
                <FolderPlus aria-hidden="true" size={16} strokeWidth={1.7} />
              }
              label="New project"
              onClick={() => setIsCreateProjectOpen(true)}
            />
          </div>

          <SidebarGroup
            items={projects.map((project) => ({
              id: project.id,
              label: project.name,
              active: project.id === activeProjectId && mode !== "home",
            }))}
            onItemSelect={selectProject}
            title="PROJECTS"
          />
          <SidebarGroup
            items={sidebarHistory.map((chat) => ({
              id: chat.id,
              label: chat.title,
              active: chat.id === activeChatId,
            }))}
            muted
            onItemSelect={(chatId) => {
              const chat = sidebarHistory.find((item) => item.id === chatId);

              selectChat(chatId, chat?.projectId);
            }}
            title="CHAT HISTORY"
          />
        </nav>
      </aside>

      {isCreateProjectOpen ? (
        <CreateProjectModal
          onClose={() => setIsCreateProjectOpen(false)}
          onCreate={(name) => {
            createProject(name);
            setIsCreateProjectOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
