import { promises as fs } from "fs";
import path from "path";
import type { ChatProject, ChatState, ProjectTab } from "../../model/chat.types";

export type ChatDatabase = ChatState & {
  assistantResponses: {
    long: string;
    short: string;
  };
  defaultModel: string;
  modelOptions: string[];
  projectTabs: ProjectTab[];
};

export type ChatApiData = {
  defaultModel: string;
  modelOptions: string[];
  projectTabs: ProjectTab[];
  state: ChatState;
};

export type ProjectSummary = {
  id: string;
  name: string;
  chatCount: number;
  sourceCount: number;
  updatedAtLabel?: string;
};

const dbPath = path.join(
  process.cwd(),
  "src",
  "features",
  "chat",
  "api",
  "db",
  "chat-db.json",
);

let writeQueue: Promise<unknown> = Promise.resolve();

export async function readChatDb() {
  const rawDb = await fs.readFile(dbPath, "utf8");

  return JSON.parse(rawDb) as ChatDatabase;
}

export async function writeChatDb(db: ChatDatabase) {
  await fs.writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`);
}

export function toChatState(db: ChatDatabase): ChatState {
  return {
    mode: db.mode,
    activeProjectId: db.activeProjectId,
    activeChatId: db.activeChatId,
    projectTab: db.projectTab,
    selectedModel: db.selectedModel,
    projects: db.projects,
    globalChats: db.globalChats,
  };
}

export function toApiData(db: ChatDatabase): ChatApiData {
  return {
    defaultModel: db.defaultModel,
    modelOptions: db.modelOptions,
    projectTabs: db.projectTabs,
    state: toChatState(db),
  };
}

export function toProjectSummaries(projects: ChatProject[]): ProjectSummary[] {
  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    chatCount: project.chats.length,
    sourceCount: project.sources.length,
    updatedAtLabel: project.chats[0]?.updatedAtLabel,
  }));
}

export async function mutateChatDb<T>(
  mutator: (db: ChatDatabase) => Promise<T> | T,
) {
  const operation = writeQueue.then(async () => {
    const db = await readChatDb();
    const result = await mutator(db);

    await writeChatDb(db);

    return { db, result };
  });

  writeQueue = operation.catch(() => undefined);

  return operation;
}
