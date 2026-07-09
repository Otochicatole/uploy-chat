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
import { useRouter } from "next/navigation";
import {
  defaultModel,
  initialChatState,
  loremResponse,
  shortResponse,
} from "./chat.mock";
import type {
  ChatMessage,
  ChatProject,
  ChatRouteState,
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
  setChatModel: (chatId: string, model: string, projectId?: string | null) => void;
  setProjectTab: (tab: ProjectTabId) => void;
  setSelectedModel: (model: string) => void;
  startNewChat: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);
const CHAT_STATE_STORAGE_KEY = "uploy-chat-state-v1";

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

function mapTargetThread(
  state: ChatState,
  chatId: string,
  projectId: string | null | undefined,
  mapper: (thread: ChatThread) => ChatThread,
) {
  if (projectId) {
    return {
      ...state,
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              chats: project.chats.map((chat) =>
                chat.id === chatId ? mapper(chat) : chat,
              ),
            }
          : project,
      ),
    };
  }

  return mapAllThreads(state, (thread) =>
    thread.id === chatId ? mapper(thread) : thread,
  );
}

function findProject(state: ChatState, projectId: string | null) {
  if (!projectId) {
    return null;
  }

  return state.projects.find((project) => project.id === projectId) ?? null;
}

function findThreadContext(
  state: ChatState,
  chatId: string | null,
  projectId?: string | null,
) {
  if (!chatId) {
    return null;
  }

  if (projectId) {
    const project = findProject(state, projectId);
    const thread = project?.chats.find((chat) => chat.id === chatId) ?? null;

    return thread ? { projectId, thread } : null;
  }

  const globalThread =
    state.globalChats.find((chat) => chat.id === chatId) ?? null;

  if (globalThread) {
    return { projectId: null, thread: globalThread };
  }

  for (const project of state.projects) {
    const projectThread = project.chats.find((chat) => chat.id === chatId);

    if (projectThread) {
      return { projectId: project.id, thread: projectThread };
    }
  }

  return null;
}

function routeToState(state: ChatState, route: ChatRouteState): ChatState {
  const routeSelectedModel = route.selectedModel?.trim();

  if (route.mode === "conversation") {
    const threadContext = findThreadContext(
      state,
      route.activeChatId ?? null,
      route.activeProjectId ?? null,
    );

    if (threadContext) {
      return {
        ...state,
        mode: "conversation",
        activeProjectId: threadContext.projectId,
        activeChatId: threadContext.thread.id,
        selectedModel:
          routeSelectedModel ||
          threadContext.thread.selectedModel ||
          state.selectedModel ||
          defaultModel,
      };
    }
  }

  if (route.mode === "project") {
    const project = findProject(state, route.activeProjectId ?? null);

    if (project) {
      return {
        ...state,
        mode: "project",
        activeProjectId: project.id,
        activeChatId: null,
        projectTab: route.projectTab ?? state.projectTab,
        selectedModel: routeSelectedModel || state.selectedModel || defaultModel,
      };
    }
  }

  return {
    ...state,
    mode: "home",
    activeProjectId: null,
    activeChatId: null,
    projectTab: "chat",
    selectedModel: routeSelectedModel || state.selectedModel || defaultModel,
  };
}

function settleLoadingMessages(state: ChatState): ChatState {
  return mapAllThreads(state, (thread) => ({
    ...thread,
    messages: thread.messages.map((message) =>
      message.status === "loading"
        ? createAssistantMessage(createId("assistant-restored"), "Restored")
        : message,
    ),
  }));
}

function readPersistedState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawState = window.localStorage.getItem(CHAT_STATE_STORAGE_KEY);

    if (!rawState) {
      return null;
    }

    const parsedState = JSON.parse(rawState) as ChatState;

    if (!Array.isArray(parsedState.projects)) {
      return null;
    }

    return settleLoadingMessages(parsedState);
  } catch {
    return null;
  }
}

function writePersistedState(state: ChatState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CHAT_STATE_STORAGE_KEY, JSON.stringify(state));
}

function getProjectPath(projectId: string, tab: ProjectTabId = "chat") {
  if (tab === "sources") {
    return `/projects/${projectId}/sources`;
  }

  if (tab === "system-prompt") {
    return `/projects/${projectId}/system-prompt`;
  }

  return `/projects/${projectId}`;
}

function getChatPath(chatId: string, projectId?: string | null) {
  if (projectId) {
    return `/projects/${projectId}/chats/${chatId}`;
  }

  return `/chats/${chatId}`;
}

function setModelSearchParam(model: string) {
  const params = new URLSearchParams(window.location.search);

  if (model) {
    params.set("model", model);
  } else {
    params.delete("model");
  }

  const query = params.toString();
  const nextUrl = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;

  window.history.replaceState(null, "", nextUrl);
}

function threadHasLoadingMessage(thread: ChatThread | null) {
  return Boolean(
    thread?.messages.some((message) => message.status === "loading"),
  );
}

const defaultRoute: ChatRouteState = {
  mode: "home",
  activeProjectId: null,
  activeChatId: null,
  projectTab: "chat",
  selectedModel: null,
};

export function ChatProvider({
  children,
  initialRoute = defaultRoute,
}: {
  children: React.ReactNode;
  initialRoute?: ChatRouteState;
}) {
  const router = useRouter();
  const [state, setState] = useState<ChatState>(() =>
    routeToState(initialChatState, initialRoute),
  );
  const [hasBootstrapped, setHasBootstrapped] = useState(false);
  const stateRef = useRef(state);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    const bootstrapTimer = window.setTimeout(() => {
      const persistedState = readPersistedState() ?? initialChatState;
      const routeState = routeToState(persistedState, initialRoute);

      stateRef.current = routeState;
      setState(routeState);
      setHasBootstrapped(true);
    }, 0);

    return () => {
      window.clearTimeout(bootstrapTimer);
    };
  }, [initialRoute]);

  useEffect(() => {
    if (!hasBootstrapped) {
      return;
    }

    stateRef.current = state;
    writePersistedState(state);
  }, [hasBootstrapped, state]);

  const commitState = useCallback(
    (updater: (currentState: ChatState) => ChatState) => {
      const nextState = updater(stateRef.current);

      stateRef.current = nextState;

      if (hasBootstrapped) {
        writePersistedState(nextState);
      }

      setState(nextState);

      return nextState;
    },
    [hasBootstrapped],
  );

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
      commitState((currentState) =>
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
    [commitState],
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
    commitState((currentState) => ({
      ...currentState,
      mode: "home",
      activeProjectId: null,
      activeChatId: null,
      projectTab: "chat",
    }));
    router.push("/");
  }, [commitState, router]);

  const selectProject = useCallback((projectId: string) => {
    commitState((currentState) => ({
      ...currentState,
      mode: "project",
      activeProjectId: projectId,
      activeChatId: null,
      projectTab: "chat",
    }));
    router.push(getProjectPath(projectId));
  }, [commitState, router]);

  const selectChat = useCallback((chatId: string, projectId?: string) => {
    commitState((currentState) => {
      const threadContext = findThreadContext(
        currentState,
        chatId,
        projectId ?? null,
      );

      return {
        ...currentState,
        mode: "conversation",
        activeProjectId: projectId ?? null,
        activeChatId: chatId,
        selectedModel:
          threadContext?.thread.selectedModel ??
          currentState.selectedModel ??
          defaultModel,
      };
    });
    router.push(getChatPath(chatId, projectId));
  }, [commitState, router]);

  const createProject = useCallback((name: string) => {
    const projectId = createId("project");

    commitState((currentState) => ({
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
    router.push(getProjectPath(projectId));
  }, [commitState, router]);

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
      const targetProjectId =
        state.activeProjectId && state.mode !== "home"
          ? state.activeProjectId
          : null;
      const targetChatId = state.activeChatId ?? createId("chat");

      commitState((currentState) => {
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
                      selectedModel: currentState.selectedModel,
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
                        selectedModel:
                          chat.selectedModel ?? currentState.selectedModel,
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
                selectedModel: currentState.selectedModel,
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
                  selectedModel: chat.selectedModel ?? currentState.selectedModel,
                  messages: [...chat.messages, ...messagesToAdd],
                }
              : chat,
          ),
        };
      });

      queueAssistantResponse(loadingMessageId, messageContent);
      router.push(getChatPath(targetChatId, targetProjectId));
    },
    [
      queueAssistantResponse,
      router,
      state.activeChatId,
      state.activeProjectId,
      state.mode,
      commitState,
    ],
  );

  const editUserMessage = useCallback(
    (messageId: string, content: string) => {
      const trimmedContent = content.trim();

      if (!trimmedContent) {
        return;
      }

      const loadingMessageId = createId("assistant-loading");

      commitState((currentState) =>
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
    [commitState, queueAssistantResponse],
  );

  const setProjectTab = useCallback((tab: ProjectTabId) => {
    commitState((currentState) => ({
      ...currentState,
      mode: "project",
      activeChatId: null,
      projectTab: tab,
    }));
    if (state.activeProjectId) {
      router.push(getProjectPath(state.activeProjectId, tab));
    }
  }, [commitState, router, state.activeProjectId]);

  const addSourcesToActiveProject = useCallback((files: File[]) => {
    if (files.length === 0) {
      return;
    }

    const sourceFiles = files.map(fileToSource);

    commitState((currentState) => {
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
  }, [commitState]);

  const removeSourceFromActiveProject = useCallback((sourceId: string) => {
    commitState((currentState) => {
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
  }, [commitState]);

  const saveSystemPrompt = useCallback((prompt: string) => {
    commitState((currentState) => {
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
  }, [commitState]);

  const setChatModel = useCallback(
    (chatId: string, model: string, projectId?: string | null) => {
      const nextState = commitState((currentState) => {
        const baseState =
          currentState.activeChatId === chatId
            ? { ...currentState, selectedModel: model }
            : currentState;

        return mapTargetThread(baseState, chatId, projectId, (thread) => ({
          ...thread,
          selectedModel: model,
        }));
      });

      if (nextState.activeChatId === chatId) {
        setModelSearchParam(model);
      }
    },
    [commitState],
  );

  const setSelectedModel = useCallback((model: string) => {
    commitState((currentState) => {
      const baseState = {
        ...currentState,
        selectedModel: model,
      };

      if (!currentState.activeChatId) {
        return baseState;
      }

      return mapTargetThread(
        baseState,
        currentState.activeChatId,
        currentState.activeProjectId,
        (thread) => ({
          ...thread,
          selectedModel: model,
        }),
      );
    });
    setModelSearchParam(model);
  }, [commitState]);

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
      setChatModel,
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
      setChatModel,
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
