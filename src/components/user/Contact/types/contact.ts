// types/contact.ts
export type Message = {
  id: number;
  from: "user" | "partner";
  content: string;
  time: string;
};

export type User = {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread?: number;
};
