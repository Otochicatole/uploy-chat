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
  addProjectSourcesRequest,
  createProjectRequest,
  getCachedChatState,
  editMessageRequest,
  getChatState,
  getProject,
  removeProjectSourceRequest,
  saveSystemPromptRequest,
  sendMessageRequest,
  serializeFiles,
  setModelRequest,
} from "../api/client/chat-api";
import type {
  ChatApiData,
  ChatProject,
  ChatRouteState,
  ChatState,
  ChatThread,
  ProjectTab,
  ProjectTabId,
  SendMessageInput,
} from "./chat.types";

type ChatContextValue = ChatState & {
  activeProject: ChatProject | null;
  activeThread: ChatThread | null;
  defaultModel: string;
  modelOptions: string[];
  projectTabs: ProjectTab[];
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

const fallbackDefaultModel = "Model";
const fallbackModelOptions = ["GPT-4.1", "Claude Sonnet", "Uploy Analyst"];
const fallbackProjectTabs: ProjectTab[] = [
  { id: "chat", label: "Chat" },
  { id: "sources", label: "Sources" },
  { id: "system-prompt", label: "System prompt" },
];
const emptyChatState: ChatState = {
  mode: "home",
  activeProjectId: null,
  activeChatId: null,
  projectTab: "chat",
  selectedModel: fallbackDefaultModel,
  projects: [],
  globalChats: [],
};
const defaultRoute: ChatRouteState = {
  mode: "home",
  activeProjectId: null,
  activeChatId: null,
  projectTab: "chat",
  selectedModel: null,
};

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

function routeToState(
  state: ChatState,
  route: ChatRouteState,
  defaultModel: string,
): ChatState {
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

function routeToPendingState(
  state: ChatState,
  route: ChatRouteState,
  defaultModel: string,
): ChatState {
  const selectedModel = route.selectedModel?.trim() || state.selectedModel || defaultModel;

  if (route.mode === "conversation") {
    return {
      ...state,
      mode: "conversation",
      activeProjectId: route.activeProjectId ?? null,
      activeChatId: route.activeChatId ?? null,
      selectedModel,
    };
  }

  if (route.mode === "project") {
    return {
      ...state,
      mode: "project",
      activeProjectId: route.activeProjectId ?? null,
      activeChatId: null,
      projectTab: route.projectTab ?? state.projectTab,
      selectedModel,
    };
  }

  return {
    ...state,
    mode: "home",
    activeProjectId: null,
    activeChatId: null,
    projectTab: "chat",
    selectedModel,
  };
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

function getCurrentRoute(state: ChatState): ChatRouteState {
  return {
    mode: state.mode,
    activeProjectId: state.activeProjectId,
    activeChatId: state.activeChatId,
    projectTab: state.projectTab,
    selectedModel: state.selectedModel,
  };
}

function mergeProject(state: ChatState, project: ChatProject): ChatState {
  const hasProject = state.projects.some((item) => item.id === project.id);

  return {
    ...state,
    projects: hasProject
      ? state.projects.map((item) => (item.id === project.id ? project : item))
      : [project, ...state.projects],
  };
}

export function ChatProvider({
  children,
  initialRoute = defaultRoute,
}: {
  children: React.ReactNode;
  initialRoute?: ChatRouteState;
}) {
  const router = useRouter();
  const initialApiData = getCachedChatState();
  const [state, setState] = useState<ChatState>(() =>
    initialApiData
      ? routeToState(
          initialApiData.state,
          initialRoute,
          initialApiData.defaultModel,
        )
      : routeToPendingState(emptyChatState, initialRoute, fallbackDefaultModel),
  );
  const [defaultModel, setDefaultModel] = useState(
    initialApiData?.defaultModel ?? fallbackDefaultModel,
  );
  const [modelOptions, setModelOptions] = useState(
    initialApiData?.modelOptions ?? fallbackModelOptions,
  );
  const [projectTabs, setProjectTabs] = useState(
    initialApiData?.projectTabs ?? fallbackProjectTabs,
  );
  const stateRef = useRef(state);
  const defaultModelRef = useRef(defaultModel);

  const commitState = useCallback((nextState: ChatState) => {
    stateRef.current = nextState;
    setState(nextState);

    return nextState;
  }, []);

  const applyApiData = useCallback(
    (data: ChatApiData, route = getCurrentRoute(stateRef.current)) => {
      defaultModelRef.current = data.defaultModel;
      setDefaultModel(data.defaultModel);
      setModelOptions(data.modelOptions);
      setProjectTabs(data.projectTabs);

      return commitState(routeToState(data.state, route, data.defaultModel));
    },
    [commitState],
  );

  useEffect(() => {
    let isCancelled = false;

    getChatState()
      .then((data) => {
        if (isCancelled) {
          return;
        }

        applyApiData(data, initialRoute);
      })
      .catch((error: unknown) => {
        console.error(error);
      });

    return () => {
      isCancelled = true;
    };
  }, [applyApiData, initialRoute]);

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

  const startNewChat = useCallback(() => {
    commitState({
      ...stateRef.current,
      mode: "home",
      activeProjectId: null,
      activeChatId: null,
      projectTab: "chat",
    });
    router.push("/");
  }, [commitState, router]);

  const selectProject = useCallback((projectId: string) => {
    commitState({
      ...stateRef.current,
      mode: "project",
      activeProjectId: projectId,
      activeChatId: null,
      projectTab: "chat",
    });
    router.push(getProjectPath(projectId));

    void getProject(projectId)
      .then(({ project }) => {
        commitState(mergeProject(stateRef.current, project));
      })
      .catch((error: unknown) => {
        console.error(error);
      });
  }, [commitState, router]);

  const selectChat = useCallback((chatId: string, projectId?: string) => {
    const threadContext = findThreadContext(
      stateRef.current,
      chatId,
      projectId ?? null,
    );

    commitState({
      ...stateRef.current,
      mode: "conversation",
      activeProjectId: projectId ?? null,
      activeChatId: chatId,
      selectedModel:
        threadContext?.thread.selectedModel ??
        stateRef.current.selectedModel ??
        defaultModelRef.current,
    });
    router.push(getChatPath(chatId, projectId));
  }, [commitState, router]);

  const createProject = useCallback(
    (name: string) => {
      void createProjectRequest(name)
        .then((data) => {
          applyApiData(data, {
            mode: "project",
            activeProjectId: data.project.id,
            activeChatId: null,
            projectTab: "chat",
          });
          router.push(getProjectPath(data.project.id));
        })
        .catch((error: unknown) => {
          console.error(error);
        });
    },
    [applyApiData, router],
  );

  const sendMessage = useCallback(
    ({ content, files = [] }: SendMessageInput) => {
      const currentState = stateRef.current;
      const targetProjectId =
        currentState.activeProjectId && currentState.mode !== "home"
          ? currentState.activeProjectId
          : null;

      void sendMessageRequest({
        chatId: currentState.activeChatId,
        content,
        files: serializeFiles(files),
        projectId: targetProjectId,
        selectedModel: currentState.selectedModel,
      })
        .then((data) => {
          applyApiData(data, {
            mode: "conversation",
            activeProjectId: data.projectId,
            activeChatId: data.chatId,
            selectedModel:
              data.thread.selectedModel ??
              data.state.selectedModel ??
              defaultModelRef.current,
          });
          router.push(getChatPath(data.chatId, data.projectId));
        })
        .catch((error: unknown) => {
          console.error(error);
        });
    },
    [applyApiData, router],
  );

  const editUserMessage = useCallback(
    (messageId: string, content: string) => {
      void editMessageRequest(messageId, content)
        .then((data) => {
          applyApiData(data, {
            mode: "conversation",
            activeProjectId: data.thread.projectId ?? null,
            activeChatId: data.thread.id,
            selectedModel:
              data.thread.selectedModel ??
              data.state.selectedModel ??
              defaultModelRef.current,
          });
        })
        .catch((error: unknown) => {
          console.error(error);
        });
    },
    [applyApiData],
  );

  const setProjectTab = useCallback((tab: ProjectTabId) => {
    const nextState = commitState({
      ...stateRef.current,
      mode: "project",
      activeChatId: null,
      projectTab: tab,
    });

    if (nextState.activeProjectId) {
      router.push(getProjectPath(nextState.activeProjectId, tab));
    }
  }, [commitState, router]);

  const addSourcesToActiveProject = useCallback(
    (files: File[]) => {
      const projectId = stateRef.current.activeProjectId;

      if (!projectId || files.length === 0) {
        return;
      }

      void addProjectSourcesRequest(projectId, serializeFiles(files))
        .then((data) => {
          applyApiData(data);
        })
        .catch((error: unknown) => {
          console.error(error);
        });
    },
    [applyApiData],
  );

  const removeSourceFromActiveProject = useCallback(
    (sourceId: string) => {
      const projectId = stateRef.current.activeProjectId;

      if (!projectId) {
        return;
      }

      void removeProjectSourceRequest(projectId, sourceId)
        .then((data) => {
          applyApiData(data);
        })
        .catch((error: unknown) => {
          console.error(error);
        });
    },
    [applyApiData],
  );

  const saveSystemPrompt = useCallback(
    (prompt: string) => {
      const projectId = stateRef.current.activeProjectId;

      if (!projectId) {
        return;
      }

      void saveSystemPromptRequest(projectId, prompt)
        .then((data) => {
          applyApiData(data);
        })
        .catch((error: unknown) => {
          console.error(error);
        });
    },
    [applyApiData],
  );

  const setChatModel = useCallback(
    (chatId: string, model: string, projectId?: string | null) => {
      void setModelRequest({ chatId, model, projectId })
        .then((data) => {
          applyApiData(data);

          if (stateRef.current.activeChatId === chatId) {
            setModelSearchParam(model);
          }
        })
        .catch((error: unknown) => {
          console.error(error);
        });
    },
    [applyApiData],
  );

  const setSelectedModel = useCallback(
    (model: string) => {
      const currentState = stateRef.current;

      void setModelRequest({
        chatId: currentState.activeChatId,
        model,
        projectId: currentState.activeProjectId,
      })
        .then((data) => {
          applyApiData(data, {
            ...getCurrentRoute(stateRef.current),
            selectedModel: model,
          });
          setModelSearchParam(model);
        })
        .catch((error: unknown) => {
          console.error(error);
        });
    },
    [applyApiData],
  );

  const sidebarHistory = activeProject ? activeProject.chats : state.globalChats;

  const value = useMemo<ChatContextValue>(
    () => ({
      ...state,
      activeProject,
      activeThread,
      defaultModel,
      modelOptions,
      projectTabs,
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
      defaultModel,
      editUserMessage,
      modelOptions,
      projectTabs,
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
