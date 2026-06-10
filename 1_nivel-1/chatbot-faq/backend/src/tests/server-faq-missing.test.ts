// Arquivo isolado: testa buildApp() quando faq.json não existe.
// O vi.doMock precisa estar no topo do arquivo para funcionar corretamente.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.doMock("../faq", () => ({
  FaqLoader: class {
    load() {
      throw new Error("FAQ file not found: /fake/path");
    }
  },
}));

describe("buildApp() — T05: faq.json ausente", () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key-123";
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.OPENROUTER_API_KEY;
  });

  it("lança FAQ file not found quando o arquivo não existe", async () => {
    const { buildApp } = await import("../server");
    expect(() => buildApp()).toThrow("FAQ file not found");
  });
});
