export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
export type OpenAIModel = "gpt-3.5-turbo" | "gpt-4";
