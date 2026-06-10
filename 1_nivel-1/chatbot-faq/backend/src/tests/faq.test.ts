import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { FaqLoader } from "../faq";

const VALID_FAQ = [
  { pergunta: "Qual o horário?", resposta: "9h às 18h.", tags: ["horario"] },
  { pergunta: "Como cancelo?", resposta: "Acesse configurações." },
  { pergunta: "Formas de pagamento?", resposta: "Cartão e Pix.", tags: ["pagamento"] },
];

function writeTempJson(content: string): string {
  const filePath = path.join(os.tmpdir(), `faq-test-${Date.now()}.json`);
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

describe("FaqLoader", () => {
  let tempFiles: string[] = [];

  afterEach(() => {
    for (const f of tempFiles) {
      try { fs.unlinkSync(f); } catch { /* ignore */ }
    }
    tempFiles = [];
  });

  function tempFaq(content: string): string {
    const p = writeTempJson(content);
    tempFiles.push(p);
    return p;
  }

  // --- load() ---

  it("T01 — load() com JSON válido retorna array com 3 FaqItems", () => {
    const filePath = tempFaq(JSON.stringify(VALID_FAQ));
    const loader = new FaqLoader(filePath);
    const items = loader.load();
    expect(items).toHaveLength(3);
    expect(items[0].pergunta).toBe("Qual o horário?");
  });

  it("T02 — load() com arquivo inexistente lança erro com o path", () => {
    const loader = new FaqLoader("/nao/existe/faq.json");
    expect(() => loader.load()).toThrow("FAQ file not found: /nao/existe/faq.json");
  });

  it("T03 — load() com JSON malformado lança 'Invalid FAQ JSON'", () => {
    const filePath = tempFaq("{broken");
    const loader = new FaqLoader(filePath);
    expect(() => loader.load()).toThrow("Invalid FAQ JSON");
  });

  it("T04 — load() com array vazio retorna [] sem erro", () => {
    const filePath = tempFaq("[]");
    const loader = new FaqLoader(filePath);
    expect(loader.load()).toEqual([]);
  });

  // --- toSystemPrompt() ---

  it("T05 — toSystemPrompt() formata com 'P:' e 'R:'", () => {
    const filePath = tempFaq(JSON.stringify([VALID_FAQ[0]]));
    const loader = new FaqLoader(filePath);
    loader.load();
    const prompt = loader.toSystemPrompt();
    expect(prompt).toContain("P: Qual o horário?");
    expect(prompt).toContain("R: 9h às 18h.");
  });

  it("T06 — toSystemPrompt() separa múltiplos itens por linha em branco", () => {
    const filePath = tempFaq(JSON.stringify(VALID_FAQ));
    const loader = new FaqLoader(filePath);
    loader.load();
    const prompt = loader.toSystemPrompt();
    const blocks = prompt.split("\n\n");
    expect(blocks).toHaveLength(3);
  });

  // --- toQuestionList() ---

  it("T07 — toQuestionList() retorna só as perguntas", () => {
    const filePath = tempFaq(JSON.stringify(VALID_FAQ));
    const loader = new FaqLoader(filePath);
    loader.load();
    const questions = loader.toQuestionList();
    expect(questions).toEqual([
      "Qual o horário?",
      "Como cancelo?",
      "Formas de pagamento?",
    ]);
  });

  it("T08 — toQuestionList() com FAQ vazio retorna []", () => {
    const filePath = tempFaq("[]");
    const loader = new FaqLoader(filePath);
    loader.load();
    expect(loader.toQuestionList()).toEqual([]);
  });
});
