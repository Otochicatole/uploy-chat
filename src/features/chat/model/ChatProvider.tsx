"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { initialChatState, loremResponse, shortResponse } from "./chat.mock";
import type {
  ChatMessage,
  ChatProject,
  ChatState,
  ChatThread,
  ContextAttachment,
  ProjectSource,
  ProjectTabId,
  SendMessageInput,
} from "./chat.types";

type ChatContextValue = ChatState & {
  activeProject: ChatProject | null;
  activeThread: ChatThread | null;
  sidebarHistory: ChatThread[];
  isResponding: boolean;
  addSourcesToActiveProject: (files: File[]) => void;
  createProject: (name: string) => void;
  editUserMessage: (messageId: string, content: string) => void;
  removeSourceFromActiveProject: (sourceId: string) => void;
  saveSystemPrompt: (prompt: string) => void;
  selectChat: (chatId: string, projectId?: string) => void;
  selectProject: (projectId: string) => void;
  sendMessage: (input: SendMessageInput) => void;
  setProjectTab: (tab: ProjectTabId) => void;
  setSelectedModel: (model: string) => void;
  startNewChat: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createTitle(content: string) {
  const trimmed = content.trim();

  if (trimmed.length <= 58) {
    return trimmed;
  }

  return `${trimmed.slice(0, 55)}...`;
}

function createPreview(content: string) {
  const trimmed = content.trim();

  if (trimmed.length <= 86) {
    return trimmed;
  }

  return `${trimmed.slice(0, 83)}...`;
}

function formatFileSize(file: File) {
  if (file.size < 1024) {
    return `${file.size} B`;
  }

  if (file.size < 1024 * 1024) {
    return `${Math.round(file.size / 1024)} KB`;
  }

  return `${(file.size / 1024 / 1024).toFixed(1)} MB`;
}

function inferFileType(fileName: string) {
  const extension = fileName.split(".").pop()?.toUpperCase();

  return extension ? extension : "File";
}

function fileToAttachment(file: File): ContextAttachment {
  return {
    id: createId("attachment"),
    name: file.name,
    sizeLabel: formatFileSize(file),
    typeLabel: inferFileType(file.name),
  };
}

function fileToSource(file: File): ProjectSource {
  const fileType = inferFileType(file.name);

  return {
    id: createId("source"),
    name: file.name,
    fileType,
    uploadedAtLabel: "Ahora",
    tone: fileType === "PDF" ? "red" : "blue",
  };
}

function createAssistantBlocks(content: string) {
  if (content.trim().length > 48) {
    return [loremResponse, shortResponse];
  }

  return [loremResponse];
}

function createLoadingMessage(id: string): ChatMessage {
  return {
    id,
    role: "assistant",
    status: "loading",
    createdAtLabel: "Thinking",
  };
}

function createAssistantMessage(id: string, content: string): ChatMessage {
  return {
    id,
    role: "assistant",
    blocks: createAssistantBlocks(content),
    status: "complete",
    createdAtLabel: "Thought for 20s",
  };
}

function mapAllThreads(
  state: ChatState,
  mapper: (thread: ChatThread) => ChatThread,
) {
  return {
    ...state,
    globalChats: state.globalChats.map(mapper),
    projects: state.projects.map((project) => ({
      ...project,
      chats: project.chats.map(mapper),
    })),
  };
}

function threadHasLoadingMessage(thread: ChatThread | null) {
  return Boolean(
    thread?.messages.some((message) => message.status === "loading"),
  );
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ChatState>(initialChatState);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const activeProject = useMemo(
    () =>
      state.projects.find((project) => project.id === state.activeProjectId) ??
      null,
    [state.activeProjectId, state.projects],
  );

  const activeThread = useMemo(() => {
    if (!state.activeChatId) {
      return null;
    }

    if (state.activeProjectId) {
      return (
        activeProject?.chats.find((chat) => chat.id === state.activeChatId) ??
        null
      );
    }

    return (
      state.globalChats.find((chat) => chat.id === state.activeChatId) ?? null
    );
  }, [activeProject, state.activeChatId, state.activeProjectId, state.globalChats]);

  const resolveAssistantResponse = useCallback(
    (loadingMessageId: string, sourceContent: string) => {
      setState((currentState) =>
        mapAllThreads(currentState, (thread) => ({
          ...thread,
          messages: thread.messages.map((message) =>
            message.id === loadingMessageId
              ? createAssistantMessage(createId("assistant"), sourceContent)
              : message,
          ),
        })),
      );
    },
    [],
  );

  const queueAssistantResponse = useCallback(
    (loadingMessageId: string, sourceContent: string) => {
      const timer = setTimeout(() => {
        resolveAssistantResponse(loadingMessageId, sourceContent);
      }, 950);

      timersRef.current.push(timer);
    },
    [resolveAssistantResponse],
  );

  const startNewChat = useCallback(() => {
    setState((currentState) => ({
      ...currentState,
      mode: "home",
      activeProjectId: null,
      activeChatId: null,
      projectTab: "chat",
    }));
  }, []);

  const selectProject = useCallback((projectId: string) => {
    setState((currentState) => ({
      ...currentState,
      mode: "project",
      activeProjectId: projectId,
      activeChatId: null,
      projectTab: "chat",
    }));
  }, []);

  const selectChat = useCallback((chatId: string, projectId?: string) => {
    setState((currentState) => ({
      ...currentState,
      mode: "conversation",
      activeProjectId: projectId ?? null,
      activeChatId: chatId,
    }));
  }, []);

  const createProject = useCallback((name: string) => {
    const projectId = createId("project");

    setState((currentState) => ({
      ...currentState,
      mode: "project",
      activeProjectId: projectId,
      activeChatId: null,
      projectTab: "chat",
      projects: [
        {
          id: projectId,
          name,
          chats: [],
          sources: [],
          systemPrompt: "",
        },
        ...currentState.projects,
      ],
    }));
  }, []);

  const sendMessage = useCallback(
    ({ content, files = [] }: SendMessageInput) => {
      const trimmedContent = content.trim();

      if (!trimmedContent && files.length === 0) {
        return;
      }

      const messageContent = trimmedContent || "Files added as context";
      const userMessageId = createId("user");
      const loadingMessageId = createId("assistant-loading");
      const attachments = files.map(fileToAttachment);
      const sourceFiles = files.map(fileToSource);

      setState((currentState) => {
        const targetProjectId =
          currentState.activeProjectId && currentState.mode !== "home"
            ? currentState.activeProjectId
            : null;
        const targetChatId = currentState.activeChatId ?? createId("chat");
        const userMessage: ChatMessage = {
          id: userMessageId,
          role: "user",
          content: messageContent,
          attachments,
          status: "complete",
          createdAtLabel: "Ahora",
        };
        const messagesToAdd = [
          userMessage,
          createLoadingMessage(loadingMessageId),
        ];

        if (targetProjectId) {
          return {
            ...currentState,
            mode: "conversation",
            activeProjectId: targetProjectId,
            activeChatId: targetChatId,
            projects: currentState.projects.map((project) => {
              if (project.id !== targetProjectId) {
                return project;
              }

              const existingChat = project.chats.find(
                (chat) => chat.id === targetChatId,
              );

              if (!existingChat) {
                return {
                  ...project,
                  sources: [...sourceFiles, ...project.sources],
                  chats: [
                    {
                      id: targetChatId,
                      projectId: targetProjectId,
                      title: createTitle(messageContent),
                      preview: createPreview(messageContent),
                      updatedAtLabel: "Ahora",
                      messages: messagesToAdd,
                    },
                    ...project.chats,
                  ],
                };
              }

              return {
                ...project,
                sources: [...sourceFiles, ...project.sources],
                chats: project.chats.map((chat) =>
                  chat.id === targetChatId
                    ? {
                        ...chat,
                        title: chat.title || createTitle(messageContent),
                        preview: createPreview(messageContent),
                        updatedAtLabel: "Ahora",
                        messages: [...chat.messages, ...messagesToAdd],
                      }
                    : chat,
                ),
              };
            }),
          };
        }

        const existingChat = currentState.globalChats.find(
          (chat) => chat.id === targetChatId,
        );

        if (!existingChat) {
          return {
            ...currentState,
            mode: "conversation",
            activeProjectId: null,
            activeChatId: targetChatId,
            globalChats: [
              {
                id: targetChatId,
                title: createTitle(messageContent),
                preview: createPreview(messageContent),
                updatedAtLabel: "Ahora",
                messages: messagesToAdd,
              },
              ...currentState.globalChats,
            ],
          };
        }

        return {
          ...currentState,
          mode: "conversation",
          activeProjectId: null,
          activeChatId: targetChatId,
          globalChats: currentState.globalChats.map((chat) =>
            chat.id === targetChatId
              ? {
                  ...chat,
                  preview: createPreview(messageContent),
                  updatedAtLabel: "Ahora",
                  messages: [...chat.messages, ...messagesToAdd],
                }
              : chat,
          ),
        };
      });

      queueAssistantResponse(loadingMessageId, messageContent);
    },
    [queueAssistantResponse],
  );

  const editUserMessage = useCallback(
    (messageId: string, content: string) => {
      const trimmedContent = content.trim();

      if (!trimmedContent) {
        return;
      }

      const loadingMessageId = createId("assistant-loading");

      setState((currentState) =>
        mapAllThreads(currentState, (thread) => {
          const messageIndex = thread.messages.findIndex(
            (message) => message.id === messageId && message.role === "user",
          );

          if (messageIndex === -1) {
            return thread;
          }

          const editedMessage: ChatMessage = {
            ...thread.messages[messageIndex],
            content: trimmedContent,
          };

          return {
            ...thread,
            title: createTitle(trimmedContent),
            preview: createPreview(trimmedContent),
            updatedAtLabel: "Ahora",
            messages: [
              ...thread.messages.slice(0, messageIndex),
              editedMessage,
              createLoadingMessage(loadingMessageId),
            ],
          };
        }),
      );

      queueAssistantResponse(loadingMessageId, trimmedContent);
    },
    [queueAssistantResponse],
  );

  const setProjectTab = useCallback((tab: ProjectTabId) => {
    setState((currentState) => ({
      ...currentState,
      mode: "project",
      activeChatId: null,
      projectTab: tab,
    }));
  }, []);

  const addSourcesToActiveProject = useCallback((files: File[]) => {
    if (files.length === 0) {
      return;
    }

    const sourceFiles = files.map(fileToSource);

    setState((currentState) => {
      if (!currentState.activeProjectId) {
        return currentState;
      }

      return {
        ...currentState,
        projects: currentState.projects.map((project) =>
          project.id === currentState.activeProjectId
            ? {
                ...project,
                sources: [...sourceFiles, ...project.sources],
              }
            : project,
        ),
      };
    });
  }, []);

  const removeSourceFromActiveProject = useCallback((sourceId: string) => {
    setState((currentState) => {
      if (!currentState.activeProjectId) {
        return currentState;
      }

      return {
        ...currentState,
        projects: currentState.projects.map((project) =>
          project.id === currentState.activeProjectId
            ? {
                ...project,
                sources: project.sources.filter(
                  (source) => source.id !== sourceId,
                ),
              }
            : project,
        ),
      };
    });
  }, []);

  const saveSystemPrompt = useCallback((prompt: string) => {
    setState((currentState) => {
      if (!currentState.activeProjectId) {
        return currentState;
      }

      return {
        ...currentState,
        projects: currentState.projects.map((project) =>
          project.id === currentState.activeProjectId
            ? { ...project, systemPrompt: prompt }
            : project,
        ),
      };
    });
  }, []);

  const setSelectedModel = useCallback((model: string) => {
    setState((currentState) => ({
      ...currentState,
      selectedModel: model,
    }));
  }, []);

  const sidebarHistory = activeProject ? activeProject.chats : state.globalChats;

  const value = useMemo<ChatContextValue>(
    () => ({
      ...state,
      activeProject,
      activeThread,
      sidebarHistory,
      isResponding: threadHasLoadingMessage(activeThread),
      addSourcesToActiveProject,
      createProject,
      editUserMessage,
      removeSourceFromActiveProject,
      saveSystemPrompt,
      selectChat,
      selectProject,
      sendMessage,
      setProjectTab,
      setSelectedModel,
      startNewChat,
    }),
    [
      activeProject,
      activeThread,
      addSourcesToActiveProject,
      createProject,
      editUserMessage,
      removeSourceFromActiveProject,
      saveSystemPrompt,
      selectChat,
      selectProject,
      sendMessage,
      setProjectTab,
      setSelectedModel,
      sidebarHistory,
      startNewChat,
      state,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used inside ChatProvider");
  }

  return context;
}
