export type ChatPreview = {
  id: string;
  title: string;
  description: string;
  date?: string;
  active?: boolean;
};

export const tabs = ["Chat", "Sources", "System prompt"];

export const modelOptions = [
  "Lorem ipsum",
  "Lorem ipsum",
  "Lorem ipsum",
  "Lorem ipsum",
];

export const chatPreviews: ChatPreview[] = [
  {
    id: "chat-1",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec imperdiet finibus ante et tempus. Quisque quis nulla in velit congue feugiat nec at eros.",
    date: "17 jun",
  },
  {
    id: "chat-2",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec imperdiet finibus ante et tempus. Quisque quis nulla in velit congue feugiat nec at eros.",
    active: true,
  },
];
