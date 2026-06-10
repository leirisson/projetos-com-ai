export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  mensagens: Message[];
  sessionId: string;
}

export interface FaqItem {
  pergunta: string;
  resposta: string;
  tags?: string[];
}
