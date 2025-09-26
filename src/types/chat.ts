export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatTab {
  id: string;
  title: string;
  messages: Message[];
  isLoading: boolean;
  error?: string;
  createdAt: Date;
  lastActive: Date;
}

export interface ChatState {
  tabs: ChatTab[];
  activeTabId: string | null;
}
