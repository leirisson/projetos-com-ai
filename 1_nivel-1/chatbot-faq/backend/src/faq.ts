import fs from "fs";
import path from "path";
import { FaqItem } from "./types";

export class FaqLoader {
  private filePath: string;
  private items: FaqItem[] = [];

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  load(): FaqItem[] {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`FAQ file not found: ${this.filePath}`);
    }

    let raw: string;
    try {
      raw = fs.readFileSync(this.filePath, "utf-8");
    } catch {
      throw new Error(`FAQ file not found: ${this.filePath}`);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Invalid FAQ JSON");
    }

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid FAQ JSON");
    }

    this.items = parsed as FaqItem[];
    return this.items;
  }

  toSystemPrompt(): string {
    return this.items
      .map((item) => `P: ${item.pergunta}\nR: ${item.resposta}`)
      .join("\n\n");
  }

  toQuestionList(): string[] {
    return this.items.map((item) => item.pergunta);
  }
}
