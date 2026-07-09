import type {
  ChatApiData,
  ChatProject,
  ChatThread,
  MockFilePayload,
} from "../../model/chat.types";

type CreateProjectResponse = ChatApiData & {
  project: ChatProject;
};

type ProjectResponse = ChatApiData & {
  project: ChatProject;
};

type SendMessageResponse = ChatApiData & {
  chatId: string;
  projectId: string | null;
  thread: ChatThread;
};

type EditMessageResponse = ChatApiData & {
  thread: ChatThread;
};

let cachedChatData: ChatApiData | null = null;

function cacheChatData<T extends ChatApiData>(data: T) {
  cachedChatData = data;

  return data;
}

async function requestJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    throw new Error(errorBody?.error ?? "Mock API request failed");
  }

  return response.json() as Promise<T>;
}

export function serializeFiles(files: File[] = []): MockFilePayload[] {
  return files.map((file) => ({
    lastModified: file.lastModified,
    name: file.name,
    size: file.size,
    type: file.type,
  }));
}

export function getCachedChatState() {
  return cachedChatData;
}

export function getChatState() {
  return requestJson<ChatApiData>("/api/chat/state").then(cacheChatData);
}

export function getProject(projectId: string) {
  return requestJson<{ project: ChatProject }>(
    `/api/chat/projects/${projectId}`,
  );
}

export function createProjectRequest(name: string) {
  return requestJson<CreateProjectResponse>("/api/chat/projects", {
    body: JSON.stringify({ name }),
    method: "POST",
  }).then(cacheChatData);
}

export function setModelRequest(input: {
  chatId?: string | null;
  model: string;
  projectId?: string | null;
}) {
  return requestJson<ChatApiData>("/api/chat/models", {
    body: JSON.stringify(input),
    method: "PATCH",
  }).then(cacheChatData);
}

export function sendMessageRequest(input: {
  chatId?: string | null;
  content: string;
  files?: MockFilePayload[];
  projectId?: string | null;
  selectedModel: string;
}) {
  return requestJson<SendMessageResponse>("/api/chat/messages", {
    body: JSON.stringify(input),
    method: "POST",
  }).then(cacheChatData);
}

export function editMessageRequest(messageId: string, content: string) {
  return requestJson<EditMessageResponse>(`/api/chat/messages/${messageId}`, {
    body: JSON.stringify({ content }),
    method: "PATCH",
  }).then(cacheChatData);
}

export function addProjectSourcesRequest(
  projectId: string,
  files: MockFilePayload[],
) {
  return requestJson<ProjectResponse>(
    `/api/chat/projects/${projectId}/sources`,
    {
      body: JSON.stringify({ files }),
      method: "POST",
    },
  ).then(cacheChatData);
}

export function removeProjectSourceRequest(
  projectId: string,
  sourceId: string,
) {
  return requestJson<ProjectResponse>(
    `/api/chat/projects/${projectId}/sources?sourceId=${encodeURIComponent(
      sourceId,
    )}`,
    {
      method: "DELETE",
    },
  ).then(cacheChatData);
}

export function saveSystemPromptRequest(projectId: string, systemPrompt: string) {
  return requestJson<ProjectResponse>(`/api/chat/projects/${projectId}`, {
    body: JSON.stringify({ systemPrompt }),
    method: "PATCH",
  }).then(cacheChatData);
}
