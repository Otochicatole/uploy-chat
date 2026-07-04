export type NavigationItem = {
  id: string;
  label: string;
  active?: boolean;
};

export const primaryActions: NavigationItem[] = [
  { id: "new-chat", label: "Nuevo chat" },
  { id: "new-project", label: "New project" },
];

export const projects: NavigationItem[] = [
  { id: "uploy", label: "Uploy" },
  { id: "vl", label: "VL" },
  { id: "superbird", label: "Superbird" },
];

export const chatHistory: NavigationItem[] = [
  { id: "history-1", label: "Lorem ipsum dolor sit amet, cons..." },
  { id: "history-2", label: "In auctor bibendum felis fesa de..." },
  { id: "history-3", label: "congue eu lectus eget, blansadi..." },
];
