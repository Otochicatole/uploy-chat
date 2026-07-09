import type { ChatState, ProjectTab } from "./chat.types";

export const projectTabs: ProjectTab[] = [
  { id: "chat", label: "Chat" },
  { id: "sources", label: "Sources" },
  { id: "system-prompt", label: "System prompt" },
];

export const defaultModel = "Model";

export const modelOptions = ["GPT-4.1", "Claude Sonnet", "Uploy Analyst"];

export const loremResponse =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec imperdiet finibus ante et tempus. Quisque quis nulla in velit congue feugiat nec at eros. Aliquam in est non tortor elementum hendrerit. Vestibulum efficitur imperdiet ultricies. In auctor bibendum felis vitae feugiat. Fusce et metus nisl. Nulla faucibus neque id odio malesuada aliquet. Sed et metus luctus, blandit mi ac, venenatis mauris. Suspendisse ante urna, sagittis nec lectus sit amet, placerat euismod elit. Aliquam sollicitudin nisl ligula, et dignissim justo commodo id. Sed lorem leo, congue eu lectus eget, blandit pulvinar tortor. Integer tincidunt lacinia congue. In hac habitasse platea dictumst. Cras tincidunt nibh mi, facilisis egestas metus commodo vitae.";

export const shortResponse =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec imperdiet finibus ante et tempus. Quisque quis nulla in velit congue feugiat nec at eros.";

export const initialChatState: ChatState = {
  mode: "home",
  activeProjectId: null,
  activeChatId: null,
  projectTab: "chat",
  selectedModel: defaultModel,
  globalChats: [
    {
      id: "global-chat-1",
      title: "Lorem ipsum dolor sit amet",
      preview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      updatedAtLabel: "17 jun",
      selectedModel: "GPT-4.1",
      messages: [
        {
          id: "global-user-1",
          role: "user",
          content: "Lorem ipsum dolor sit amet",
          status: "complete",
          createdAtLabel: "Ahora",
        },
        {
          id: "global-assistant-1",
          role: "assistant",
          blocks: [loremResponse],
          status: "complete",
          createdAtLabel: "Thought for 20s",
        },
      ],
    },
    {
      id: "global-chat-2",
      title: "Lorem ipsum dolor sit amet, cons...",
      preview: "Donec imperdiet finibus ante et tempus.",
      updatedAtLabel: "17 jun",
      selectedModel: "Claude Sonnet",
      messages: [
        {
          id: "global-user-2",
          role: "user",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
          status: "complete",
          createdAtLabel: "Ahora",
        },
        {
          id: "global-assistant-2",
          role: "assistant",
          blocks: [shortResponse, shortResponse],
          status: "complete",
          createdAtLabel: "Thought for 20s",
        },
      ],
    },
    {
      id: "global-chat-3",
      title: "In auctor bibendum felis fesa de...",
      preview: "Fusce et metus nisl. Nulla faucibus neque id odio.",
      updatedAtLabel: "17 jun",
      selectedModel: "Uploy Analyst",
      messages: [],
    },
  ],
  projects: [
    {
      id: "project-uploy-2",
      name: "Uploy 2.0",
      systemPrompt: loremResponse,
      sources: [
        {
          id: "source-uploy-presentation",
          name: "Presentacion de Uploy.doc",
          fileType: "Document",
          uploadedAtLabel: "18 jun",
          tone: "blue",
        },
        {
          id: "source-uploy-bases",
          name: "Bases de Uploy.pdf",
          fileType: "PDF",
          uploadedAtLabel: "18 jun",
          tone: "red",
        },
      ],
      chats: [
        {
          id: "project-chat-1",
          projectId: "project-uploy-2",
          title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          preview:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec imperdiet finibus ante et tempus.",
          updatedAtLabel: "17 jun",
          selectedModel: "GPT-4.1",
          messages: [
            {
              id: "project-user-1",
              role: "user",
              content: "Lorem ipsum dolor sit amet",
              status: "complete",
              createdAtLabel: "Ahora",
            },
            {
              id: "project-assistant-1",
              role: "assistant",
              blocks: [loremResponse],
              status: "complete",
              createdAtLabel: "Thought for 20s",
            },
          ],
        },
        {
          id: "project-chat-2",
          projectId: "project-uploy-2",
          title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          preview:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec imperdiet finibus ante et tempus.",
          updatedAtLabel: "17 jun",
          selectedModel: "Claude Sonnet",
          messages: [],
        },
      ],
    },
    {
      id: "project-uploy",
      name: "Uploy",
      systemPrompt: "",
      sources: [],
      chats: [],
    },
    {
      id: "project-vl",
      name: "VL",
      systemPrompt: "",
      sources: [],
      chats: [],
    },
    {
      id: "project-superbird",
      name: "Superbird",
      systemPrompt: "",
      sources: [],
      chats: [],
    },
  ],
};
