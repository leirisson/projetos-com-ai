"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function useFaq() {
  const [perguntas, setPerguntas] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/faq`)
      .then((r) => r.json())
      .then((data: { perguntas: string[] }) => setPerguntas(data.perguntas))
      .catch(() => {
        // silencioso — placeholder genérico é suficiente
      });
  }, []);

  const placeholder =
    perguntas.length > 0
      ? perguntas[Math.floor(Math.random() * perguntas.length)]
      : "Digite sua pergunta...";

  return { perguntas, placeholder };
}
