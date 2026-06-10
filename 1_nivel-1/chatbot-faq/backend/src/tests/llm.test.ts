import { describe, it, expect, vi } from "vitest";
import { LlmService } from "../services/llm";
import type OpenAI from "openai";

function makeStream(tokens: string[]): AsyncIterable<unknown> {
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const token of tokens) {
        yield { choices: [{ delta: { content: token } }] };
      }
    },
  };
}

function makeMockClient(
  tokens: string[],
  throwError?: { status: number; message: string }
): OpenAI {
  return {
    chat: {
      completions: {
        create: throwError
          ? vi.fn().mockRejectedValue(throwError)
          : vi.fn().mockResolvedValue(makeStream(tokens)),
      },
    },
  } as unknown as OpenAI;
}

describe("LlmService", () => {
  // --- construtor ---

  it("T01 — instancia com apiKey válida sem lançar erro", () => {
    expect(() => new LlmService("key-123")).not.toThrow();
  });

  it("T02 — instancia sem apiKey lança OPENROUTER_API_KEY is required", () => {
    expect(() => new LlmService("")).toThrow("OPENROUTER_API_KEY is required");
  });

  // --- streamChat ---

  it("T03 — streamChat emite os tokens do mock", async () => {
    const client = makeMockClient(["Olá", " mundo", "!"]);
    const svc = new LlmService("key", undefined, client);
    const tokens: string[] = [];
    for await (const t of svc.streamChat([{ role: "user", content: "oi" }], "prompt")) {
      tokens.push(t);
    }
    expect(tokens).toEqual(["Olá", " mundo", "!"]);
  });

  it("T04 — streamChat injeta system prompt como primeira mensagem", async () => {
    const createMock = vi.fn().mockResolvedValue(makeStream(["ok"]));
    const client = { chat: { completions: { create: createMock } } } as unknown as OpenAI;
    const svc = new LlmService("key", undefined, client);

    for await (const _ of svc.streamChat([{ role: "user", content: "x" }], "meu-prompt")) { /* drain */ }

    const callArgs = createMock.mock.calls[0][0] as { messages: Array<{ role: string; content: string }> };
    expect(callArgs.messages[0]).toEqual({ role: "system", content: "meu-prompt" });
  });

  it("T05 — streamChat ignora chunks com conteúdo vazio", async () => {
    const client = makeMockClient(["", "token", ""]);
    const svc = new LlmService("key", undefined, client);
    const tokens: string[] = [];
    for await (const t of svc.streamChat([{ role: "user", content: "x" }], "p")) {
      tokens.push(t);
    }
    expect(tokens).toEqual(["token"]);
  });

  it("T06 — streamChat com erro 429 relança LLM API error", async () => {
    const client = makeMockClient([], { status: 429, message: "Too Many Requests" });
    const svc = new LlmService("key", undefined, client);
    await expect(async () => {
      for await (const _ of svc.streamChat([{ role: "user", content: "x" }], "p")) { /* drain */ }
    }).rejects.toThrow("LLM API error: 429 Too Many Requests");
  });

  it("T07 — usa model padrão anthropic/claude-sonnet-4-6", async () => {
    const createMock = vi.fn().mockResolvedValue(makeStream([]));
    const client = { chat: { completions: { create: createMock } } } as unknown as OpenAI;
    const svc = new LlmService("key", undefined, client);
    for await (const _ of svc.streamChat([{ role: "user", content: "x" }], "p")) { /* drain */ }
    expect(createMock.mock.calls[0][0].model).toBe("anthropic/claude-sonnet-4-6");
  });

  it("T08 — usa model customizado quando informado", async () => {
    const createMock = vi.fn().mockResolvedValue(makeStream([]));
    const client = { chat: { completions: { create: createMock } } } as unknown as OpenAI;
    const svc = new LlmService("key", "openai/gpt-4o", client);
    for await (const _ of svc.streamChat([{ role: "user", content: "x" }], "p")) { /* drain */ }
    expect(createMock.mock.calls[0][0].model).toBe("openai/gpt-4o");
  });
});
