import type {
  ChatMessage,
  ChatProject,
  ChatState,
  ChatThread,
  ContextAttachment,
  ProjectSource,
} from "../../model/chat.types";
import type { ChatDatabase } from "./chat-db";

export type MockFilePayload = {
  lastModified?: number;
  name: string;
  size: number;
  type?: string;
};

export type SendMessagePayload = {
  chatId?: string | null;
  content: string;
  files?: MockFilePayload[];
  projectId?: string | null;
  selectedModel?: string;
};

export type SendMessageResult = {
  chatId: string;
  projectId: string | null;
  thread: ChatThread;
};

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

function formatFileSize(file: MockFilePayload) {
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

function fileToAttachment(file: MockFilePayload): ContextAttachment {
  return {
    id: createId("attachment"),
    name: file.name,
    sizeLabel: formatFileSize(file),
    typeLabel: inferFileType(file.name),
  };
}

function fileToSource(file: MockFilePayload): ProjectSource {
  const fileType = inferFileType(file.name);

  return {
    id: createId("source"),
    name: file.name,
    fileType,
    uploadedAtLabel: "Ahora",
    tone: fileType === "PDF" ? "red" : "blue",
  };
}

function createAssistantBlocks(db: ChatDatabase, content: string) {
  if (content.trim().length > 48) {
    return [db.assistantResponses.long, db.assistantResponses.short];
  }

  return [db.assistantResponses.long];
}

function createAssistantMessage(db: ChatDatabase, content: string): ChatMessage {
  return {
    id: createId("assistant"),
    role: "assistant",
    blocks: createAssistantBlocks(db, content),
    status: "complete",
    createdAtLabel: "Thought for 20s",
  };
}

function createUserMessage(
  content: string,
  attachments: ContextAttachment[],
): ChatMessage {
  return {
    id: createId("user"),
    role: "user",
    content,
    attachments,
    status: "complete",
    createdAtLabel: "Ahora",
  };
}

function findProject(db: ChatDatabase, projectId: string | null | undefined) {
  if (!projectId) {
    return null;
  }

  return db.projects.find((project) => project.id === projectId) ?? null;
}

function findThreadContext(
  db: ChatDatabase,
  chatId: string,
  projectId?: string | null,
) {
  if (projectId) {
    const project = findProject(db, projectId);
    const thread = project?.chats.find((chat) => chat.id === chatId) ?? null;

    return thread ? { projectId, thread } : null;
  }

  const globalThread = db.globalChats.find((chat) => chat.id === chatId);

  if (globalThread) {
    return { projectId: null, thread: globalThread };
  }

  for (const project of db.projects) {
    const projectThread = project.chats.find((chat) => chat.id === chatId);

    if (projectThread) {
      return { projectId: project.id, thread: projectThread };
    }
  }

  return null;
}

function replaceThread(
  db: ChatDatabase,
  chatId: string,
  projectId: string | null | undefined,
  mapper: (thread: ChatThread) => ChatThread,
) {
  if (projectId) {
    const project = findProject(db, projectId);

    if (!project) {
      return null;
    }

    let updatedThread: ChatThread | null = null;

    project.chats = project.chats.map((chat) => {
      if (chat.id !== chatId) {
        return chat;
      }

      const nextThread = mapper(chat);

      updatedThread = nextThread;

      return nextThread;
    });

    return updatedThread;
  }

  let updatedThread: ChatThread | null = null;

  db.globalChats = db.globalChats.map((chat) => {
    if (chat.id !== chatId) {
      return chat;
    }

    const nextThread = mapper(chat);

    updatedThread = nextThread;

    return nextThread;
  });

  if (updatedThread) {
    return updatedThread;
  }

  for (const project of db.projects) {
    project.chats = project.chats.map((chat) => {
      if (chat.id !== chatId) {
        return chat;
      }

      const nextThread = mapper(chat);

      updatedThread = nextThread;

      return nextThread;
    });

    if (updatedThread) {
      return updatedThread;
    }
  }

  return null;
}

export function createProject(db: ChatDatabase, name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Project name is required");
  }

  const projectId = createId("project");
  const project: ChatProject = {
    id: projectId,
    name: trimmedName,
    chats: [],
    sources: [],
    systemPrompt: "",
  };

  db.projects = [project, ...db.projects];
  db.mode = "project";
  db.activeProjectId = projectId;
  db.activeChatId = null;
  db.projectTab = "chat";

  return project;
}

export function updateProjectPrompt(
  db: ChatDatabase,
  projectId: string,
  systemPrompt: string,
) {
  const project = findProject(db, projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  project.systemPrompt = systemPrompt;

  return project;
}

export function addProjectSources(
  db: ChatDatabase,
  projectId: string,
  files: MockFilePayload[],
) {
  const project = findProject(db, projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  const sources = files.map(fileToSource);

  project.sources = [...sources, ...project.sources];

  return project;
}

export function removeProjectSource(
  db: ChatDatabase,
  projectId: string,
  sourceId: string,
) {
  const project = findProject(db, projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  project.sources = project.sources.filter((source) => source.id !== sourceId);

  return project;
}

export function setSelectedModel(
  db: ChatDatabase,
  model: string,
  chatId?: string | null,
  projectId?: string | null,
) {
  if (!db.modelOptions.includes(model)) {
    throw new Error("Model not found");
  }

  db.selectedModel = model;

  if (chatId) {
    const updatedThread = replaceThread(db, chatId, projectId, (thread) => ({
      ...thread,
      selectedModel: model,
    }));

    if (!updatedThread) {
      throw new Error("Chat not found");
    }
  }
}

export function sendMessage(
  db: ChatDatabase,
  payload: SendMessagePayload,
): SendMessageResult {
  const trimmedContent = payload.content.trim();
  const files = payload.files ?? [];

  if (!trimmedContent && files.length === 0) {
    throw new Error("Message content or files are required");
  }

  const messageContent = trimmedContent || "Files added as context";
  const selectedModel = payload.selectedModel || db.selectedModel;
  const attachments = files.map(fileToAttachment);
  const sourceFiles = files.map(fileToSource);
  const messagesToAdd = [
    createUserMessage(messageContent, attachments),
    createAssistantMessage(db, messageContent),
  ];
  const targetProjectId = payload.projectId ?? null;
  const targetChatId = payload.chatId || createId("chat");

  db.selectedModel = selectedModel;
  db.mode = "conversation";
  db.activeProjectId = targetProjectId;
  db.activeChatId = targetChatId;

  if (targetProjectId) {
    const project = findProject(db, targetProjectId);

    if (!project) {
      throw new Error("Project not found");
    }

    project.sources = [...sourceFiles, ...project.sources];

    const existingChat = project.chats.find((chat) => chat.id === targetChatId);

    if (!existingChat) {
      const thread: ChatThread = {
        id: targetChatId,
        projectId: targetProjectId,
        title: createTitle(messageContent),
        preview: createPreview(messageContent),
        updatedAtLabel: "Ahora",
        selectedModel,
        messages: messagesToAdd,
      };

      project.chats = [thread, ...project.chats];

      return { chatId: targetChatId, projectId: targetProjectId, thread };
    }

    existingChat.title = existingChat.title || createTitle(messageContent);
    existingChat.preview = createPreview(messageContent);
    existingChat.updatedAtLabel = "Ahora";
    existingChat.selectedModel = existingChat.selectedModel ?? selectedModel;
    existingChat.messages = [...existingChat.messages, ...messagesToAdd];

    return {
      chatId: targetChatId,
      projectId: targetProjectId,
      thread: existingChat,
    };
  }

  const existingChat = db.globalChats.find((chat) => chat.id === targetChatId);

  if (!existingChat) {
    const thread: ChatThread = {
      id: targetChatId,
      title: createTitle(messageContent),
      preview: createPreview(messageContent),
      updatedAtLabel: "Ahora",
      selectedModel,
      messages: messagesToAdd,
    };

    db.globalChats = [thread, ...db.globalChats];

    return { chatId: targetChatId, projectId: null, thread };
  }

  existingChat.preview = createPreview(messageContent);
  existingChat.updatedAtLabel = "Ahora";
  existingChat.selectedModel = existingChat.selectedModel ?? selectedModel;
  existingChat.messages = [...existingChat.messages, ...messagesToAdd];

  return { chatId: targetChatId, projectId: null, thread: existingChat };
}

export function editUserMessage(
  db: ChatDatabase,
  messageId: string,
  content: string,
) {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Message content is required");
  }

  for (const thread of [
    ...db.globalChats,
    ...db.projects.flatMap((project) => project.chats),
  ]) {
    const messageIndex = thread.messages.findIndex(
      (message) => message.id === messageId && message.role === "user",
    );

    if (messageIndex === -1) {
      continue;
    }

    const editedMessage: ChatMessage = {
      ...thread.messages[messageIndex],
      content: trimmedContent,
    };

    thread.title = createTitle(trimmedContent);
    thread.preview = createPreview(trimmedContent);
    thread.updatedAtLabel = "Ahora";
    thread.messages = [
      ...thread.messages.slice(0, messageIndex),
      editedMessage,
      createAssistantMessage(db, trimmedContent),
    ];

    db.mode = "conversation";
    db.activeProjectId = thread.projectId ?? null;
    db.activeChatId = thread.id;

    return thread;
  }

  throw new Error("Message not found");
}

export function stateWithRoute(
  db: ChatDatabase,
  state: Partial<Pick<ChatState, "activeChatId" | "activeProjectId" | "mode">>,
) {
  db.mode = state.mode ?? db.mode;
  db.activeProjectId = state.activeProjectId ?? null;
  db.activeChatId = state.activeChatId ?? null;
}

export function findProjectById(db: ChatDatabase, projectId: string) {
  return findProject(db, projectId);
}

export function findThreadById(
  db: ChatDatabase,
  chatId: string,
  projectId?: string | null,
) {
  return findThreadContext(db, chatId, projectId);
}
