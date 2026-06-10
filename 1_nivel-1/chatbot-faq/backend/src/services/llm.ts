import OpenAI from "openai";
import { Message } from "../types";

const DEFAULT_MODEL = "anthropic/claude-sonnet-4-6";

export class LlmService {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model?: string, client?: OpenAI) {
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is required");
    }

    this.model = model ?? DEFAULT_MODEL;
    this.client =
      client ??
      new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey,
      });
  }

  async *streamChat(
    mensagens: Message[],
    systemPrompt: string
  ): AsyncIterable<string> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...mensagens.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    ];

    let stream: Awaited<ReturnType<typeof this.client.chat.completions.create>>;

    try {
      stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        stream: true,
      });
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      throw new Error(
        `LLM API error: ${e.status ?? 500} ${e.message ?? "Unknown error"}`
      );
    }

    for await (const chunk of stream as AsyncIterable<OpenAI.Chat.ChatCompletionChunk>) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  }
}
