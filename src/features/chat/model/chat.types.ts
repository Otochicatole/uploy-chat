export type WorkspaceMode = "home" | "project" | "conversation";

export type ProjectTabId = "chat" | "sources" | "system-prompt";

export type ChatRole = "user" | "assistant";

export type ChatMessageStatus = "complete" | "loading";

export type ContextAttachment = {
  id: string;
  name: string;
  sizeLabel: string;
  typeLabel: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content?: string;
  blocks?: string[];
  attachments?: ContextAttachment[];
  status: ChatMessageStatus;
  createdAtLabel: string;
};

export type ChatThread = {
  id: string;
  title: string;
  preview: string;
  updatedAtLabel?: string;
  selectedModel?: string;
  projectId?: string;
  messages: ChatMessage[];
};

export type ProjectSource = {
  id: string;
  name: string;
  fileType: string;
  uploadedAtLabel: string;
  tone: "blue" | "red" | "green";
};

export type ChatProject = {
  id: string;
  name: string;
  chats: ChatThread[];
  sources: ProjectSource[];
  systemPrompt: string;
};

export type ChatState = {
  mode: WorkspaceMode;
  activeProjectId: string | null;
  activeChatId: string | null;
  projectTab: ProjectTabId;
  selectedModel: string;
  projects: ChatProject[];
  globalChats: ChatThread[];
};

export type ChatApiData = {
  defaultModel: string;
  modelOptions: string[];
  projectTabs: ProjectTab[];
  state: ChatState;
};

export type ChatRouteState = {
  mode: WorkspaceMode;
  activeProjectId?: string | null;
  activeChatId?: string | null;
  projectTab?: ProjectTabId;
  selectedModel?: string | null;
};

export type ProjectTab = {
  id: ProjectTabId;
  label: string;
};

export type SendMessageInput = {
  content: string;
  files?: File[];
};

export type MockFilePayload = {
  lastModified?: number;
  name: string;
  size: number;
  type?: string;
};
