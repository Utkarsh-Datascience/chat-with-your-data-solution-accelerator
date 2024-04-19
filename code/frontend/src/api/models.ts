export type AskResponse = {
  answer: string;
  citations: Citation[];
  error?: string;
};

export type Citation = {
  content: string;
  id: string;
  title: string | null;
  filepath: string | null;
  url: string | null;
  // metadata: string | null;
  metadata: CitationMetadata | null;
  chunk_id: string | null;
  reindex_id: string | null;
};

export type ToolMessageContent = {
  citations: Citation[];
  intent: string;
};

export type ChatMessage = {
  role: string;
  content: string;
  end_turn?: boolean;
};

export enum ChatCompletionType {
  ChatCompletion = "chat.completion",
  ChatCompletionChunk = "chat.completion.chunk",
}

export type ChatResponseChoice = {
  messages: ChatMessage[];
};

export type ChatResponse = {
  id: string;
  model: string;
  created: number;
  object: ChatCompletionType;
  choices: ChatResponseChoice[];
  error: string;
};

export type ConversationRequest = {
  id?: string;
  messages: ChatMessage[];
};

export type CitationMetadata = {
  chunk: number;
  filename: string;
  key: string | null;
  markdown_url: string | null;
  offset: number | null;
  original_url: string | null;
  source: string | null;
  title: string | null;
};
