import { describe, it, expect, vi, beforeEach } from "vitest";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { healthRoutes } from "../routes/health";
import { faqRoutes } from "../routes/faq";
import { chatRoutes } from "../routes/chat";
import type { FaqLoader } from "../faq";
import type { LlmService } from "../services/llm";

// --- helpers ---

function makeFaqLoader(questions: string[] = ["Q1", "Q2"], systemPrompt = "faq-prompt"): FaqLoader {
  return {
    toQuestionList: vi.fn().mockReturnValue(questions),
    toSystemPrompt: vi.fn().mockReturnValue(systemPrompt),
    load: vi.fn(),
  } as unknown as FaqLoader;
}

function makeLlmService(tokens: string[] = ["Olá", "!"]): LlmService {
  return {
    streamChat: vi.fn().mockImplementation(async function* () {
      for (const t of tokens) yield t;
    }),
  } as unknown as LlmService;
}

async function buildTestApp(faq: FaqLoader, llm: LlmService) {
  const app = Fastify();
  await app.register(cors, { origin: true });
  await app.register(healthRoutes);
  await app.register(async (i) => faqRoutes(i, faq));
  await app.register(async (i) => chatRoutes(i, faq, llm));
  await app.ready();
  return app;
}

// ========== GET /health ==========

describe("GET /health", () => {
  it("T01 — retorna 200 com { status: 'ok' }", async () => {
    const app = await buildTestApp(makeFaqLoader(), makeLlmService());
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });

  it("T02 — Content-Type é application/json", async () => {
    const app = await buildTestApp(makeFaqLoader(), makeLlmService());
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.headers["content-type"]).toContain("application/json");
  });

  it("T03 — POST /health retorna 404", async () => {
    const app = await buildTestApp(makeFaqLoader(), makeLlmService());
    const res = await app.inject({ method: "POST", url: "/health" });
    expect(res.statusCode).toBe(404);
  });
});

// ========== GET /faq ==========

describe("GET /faq", () => {
  it("T01 — retorna 200 com as perguntas do FAQ", async () => {
    const app = await buildTestApp(makeFaqLoader(["P1", "P2", "P3"]), makeLlmService());
    const res = await app.inject({ method: "GET", url: "/faq" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ perguntas: ["P1", "P2", "P3"] });
  });

  it("T02 — FAQ vazio retorna perguntas: []", async () => {
    const app = await buildTestApp(makeFaqLoader([]), makeLlmService());
    const res = await app.inject({ method: "GET", url: "/faq" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ perguntas: [] });
  });

  it("T03 — Content-Type é application/json", async () => {
    const app = await buildTestApp(makeFaqLoader(), makeLlmService());
    const res = await app.inject({ method: "GET", url: "/faq" });
    expect(res.headers["content-type"]).toContain("application/json");
  });

  it("T04 — body tem chave 'perguntas', não 'items' ou 'data'", async () => {
    const app = await buildTestApp(makeFaqLoader(), makeLlmService());
    const res = await app.inject({ method: "GET", url: "/faq" });
    const body = res.json();
    expect(body).toHaveProperty("perguntas");
    expect(body).not.toHaveProperty("items");
    expect(body).not.toHaveProperty("data");
  });
});

// ========== POST /chat ==========

describe("POST /chat", () => {
  const validBody = {
    mensagens: [{ role: "user", content: "qual o horário?" }],
    sessionId: "s1",
  };

  it("T01 — request válido retorna 200 com headers SSE", async () => {
    const app = await buildTestApp(makeFaqLoader(), makeLlmService());
    const res = await app.inject({
      method: "POST",
      url: "/chat",
      payload: validBody,
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/event-stream");
    expect(res.headers["cache-control"]).toContain("no-cache");
    expect(res.headers["connection"]).toContain("keep-alive");
  });

  it("T02 — tokens chegam no formato SSE", async () => {
    const app = await buildTestApp(makeFaqLoader(), makeLlmService(["Oi", "!"]));
    const res = await app.inject({ method: "POST", url: "/chat", payload: validBody });
    expect(res.body).toContain("data: Oi\n\n");
    expect(res.body).toContain("data: !\n\n");
  });

  it("T03 — stream termina com data: [DONE]", async () => {
    const app = await buildTestApp(makeFaqLoader(), makeLlmService(["token"]));
    const res = await app.inject({ method: "POST", url: "/chat", payload: validBody });
    expect(res.body.endsWith("data: [DONE]\n\n")).toBe(true);
  });

  it("T04 — mensagens ausente retorna 400", async () => {
    const app = await buildTestApp(makeFaqLoader(), makeLlmService());
    const res = await app.inject({
      method: "POST",
      url: "/chat",
      payload: { sessionId: "x" },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toHaveProperty("error");
  });

  it("T05 — mensagens não é array retorna 400", async () => {
    const app = await buildTestApp(makeFaqLoader(), makeLlmService());
    const res = await app.inject({
      method: "POST",
      url: "/chat",
      payload: { mensagens: "string", sessionId: "x" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("T06 — mensagens vazio retorna 400 com mensagem 'mensagens não pode ser vazio'", async () => {
    const app = await buildTestApp(makeFaqLoader(), makeLlmService());
    const res = await app.inject({
      method: "POST",
      url: "/chat",
      payload: { mensagens: [], sessionId: "x" },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toContain("mensagens não pode ser vazio");
  });

  it("T07 — sessionId ausente retorna 400", async () => {
    const app = await buildTestApp(makeFaqLoader(), makeLlmService());
    const res = await app.inject({
      method: "POST",
      url: "/chat",
      payload: { mensagens: [{ role: "user", content: "x" }] },
    });
    expect(res.statusCode).toBe(400);
  });

  it("T08 — erro na LLM escreve [DONE] e encerra stream sem 500", async () => {
    const llm = {
      streamChat: vi.fn().mockImplementation(async function* () {
        throw new Error("LLM API error: 500 boom");
      }),
    } as unknown as LlmService;
    const app = await buildTestApp(makeFaqLoader(), llm);
    const res = await app.inject({ method: "POST", url: "/chat", payload: validBody });
    // SSE já iniciou com 200, erro é absorvido e stream fechado
    expect(res.statusCode).toBe(200);
    expect(res.body).toContain("data: [DONE]");
  });

  it("T09 — system prompt inclui conteúdo do FAQ", async () => {
    const streamChatMock = vi.fn().mockImplementation(async function* () { yield "ok"; });
    const llm = { streamChat: streamChatMock } as unknown as LlmService;
    const faq = makeFaqLoader([], "MINHA-BASE-FAQ");
    const app = await buildTestApp(faq, llm);
    await app.inject({ method: "POST", url: "/chat", payload: validBody });
    const [, systemPrompt] = streamChatMock.mock.calls[0] as [unknown, string];
    expect(systemPrompt).toContain("MINHA-BASE-FAQ");
  });

  it("T10 — histórico multi-turn passa todas as mensagens ao LlmService", async () => {
    const streamChatMock = vi.fn().mockImplementation(async function* () { yield "ok"; });
    const llm = { streamChat: streamChatMock } as unknown as LlmService;
    const app = await buildTestApp(makeFaqLoader(), llm);
    const mensagens = [
      { role: "user", content: "msg1" },
      { role: "assistant", content: "resp1" },
      { role: "user", content: "msg2" },
      { role: "assistant", content: "resp2" },
    ];
    await app.inject({ method: "POST", url: "/chat", payload: { mensagens, sessionId: "s1" } });
    const [passedMensagens] = streamChatMock.mock.calls[0] as [typeof mensagens];
    expect(passedMensagens).toHaveLength(4);
    expect(passedMensagens[0].content).toBe("msg1");
    expect(passedMensagens[3].content).toBe("resp2");
  });
});
