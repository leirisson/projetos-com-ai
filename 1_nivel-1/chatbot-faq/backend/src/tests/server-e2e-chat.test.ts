// Arquivo isolado: testa POST /chat com mock de LlmService via vi.doMock.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.doMock("../services/llm", () => ({
  LlmService: class {
    constructor() {}
    async *streamChat() {
      yield "token1";
      yield "token2";
      yield "token3";
    }
  },
}));

describe("E2E — T01: fluxo completo /chat com mock LLM", () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key-e2e";
    vi.resetModules();
  });

  afterEach(async () => {
    delete process.env.OPENROUTER_API_KEY;
  });

  it("emite 3 tokens + [DONE] via SSE", async () => {
    const { buildApp } = await import("../server");
    const app = buildApp();
    await app.ready();

    const res = await app.inject({
      method: "POST",
      url: "/chat",
      payload: {
        mensagens: [{ role: "user", content: "qual o horário?" }],
        sessionId: "e2e-session",
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toContain("data: token1\n\n");
    expect(res.body).toContain("data: token2\n\n");
    expect(res.body).toContain("data: token3\n\n");
    expect(res.body).toContain("data: [DONE]\n\n");

    await app.close();
  });
});
