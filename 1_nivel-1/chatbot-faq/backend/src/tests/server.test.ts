import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// ========== buildApp() — testes de composição ==========

describe("buildApp()", () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key-123";
    vi.resetModules();
  });

  afterEach(async () => {
    delete process.env.OPENROUTER_API_KEY;
    vi.resetModules();
  });

  it("T01 — cria instância Fastify válida com env configurada", async () => {
    const { buildApp } = await import("../server");
    const app = buildApp();
    await app.ready();
    expect(app).toBeDefined();
    await app.close();
  });

  it("T02 — CORS habilitado: OPTIONS /chat retorna Access-Control-Allow-Origin", async () => {
    const { buildApp } = await import("../server");
    const app = buildApp();
    await app.ready();
    const res = await app.inject({
      method: "OPTIONS",
      url: "/chat",
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
      },
    });
    expect(res.headers["access-control-allow-origin"]).toBeDefined();
    await app.close();
  });

  it("T03 — rotas GET /health, GET /faq e POST /chat existem (não 404)", async () => {
    const { buildApp } = await import("../server");
    const app = buildApp();
    await app.ready();

    const health = await app.inject({ method: "GET", url: "/health" });
    expect(health.statusCode).not.toBe(404);

    const faq = await app.inject({ method: "GET", url: "/faq" });
    expect(faq.statusCode).not.toBe(404);

    const chat = await app.inject({
      method: "POST",
      url: "/chat",
      payload: {},
    });
    expect(chat.statusCode).not.toBe(404);

    await app.close();
  });

  it("T04 — OPENROUTER_API_KEY ausente lança erro", async () => {
    delete process.env.OPENROUTER_API_KEY;
    const { buildApp } = await import("../server");
    expect(() => buildApp()).toThrow("OPENROUTER_API_KEY is required");
  });
});

// ========== E2E — fluxo sem mock de LLM ==========

describe("E2E — endpoints básicos", () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key-e2e";
    vi.resetModules();
  });

  afterEach(async () => {
    delete process.env.OPENROUTER_API_KEY;
    vi.resetModules();
  });

  it("T02 — /health e /faq retornam 200", async () => {
    const { buildApp } = await import("../server");
    const app = buildApp();
    await app.ready();

    expect((await app.inject({ method: "GET", url: "/health" })).statusCode).toBe(200);
    expect((await app.inject({ method: "GET", url: "/faq" })).statusCode).toBe(200);

    await app.close();
  });

  it("T03 — CORS preflight em /chat retorna 204 com Access-Control-Allow-Origin", async () => {
    const { buildApp } = await import("../server");
    const app = buildApp();
    await app.ready();

    const res = await app.inject({
      method: "OPTIONS",
      url: "/chat",
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
      },
    });

    expect(res.statusCode).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");

    await app.close();
  });
});
