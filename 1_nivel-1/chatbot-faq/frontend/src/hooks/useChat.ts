"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Message } from "@/components/chat/MessageBubble";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [latency, setLatency] = useState<number | undefined>(undefined);
  const sessionId = useRef<string | null>(null);
  useEffect(() => {
    if (!sessionId.current) {
      sessionId.current = typeof crypto !== "undefined" ? crypto.randomUUID() : generateId();
    }
  }, []);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: Message = {
        id: generateId(),
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      const assistantMsgId = generateId();
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsLoading(true);

      const t0 = performance.now();
      const abort = new AbortController();
      abortRef.current = abort;

      try {
        const res = await fetch(`${API_URL}/chat`, {
          method: "POST",
          signal: abort.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId.current ?? "",
            mensagens: [...messages, userMsg].map(({ role, content }) => ({
              role,
              content,
            })),
          }),
        });

        if (!res.ok || !res.body) {
          const errorText = await res.text().catch(() => "Erro desconhecido");
          throw new Error(errorText);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let firstChunk = true;
        let rafId: number | null = null;

        const flush = () => {
          rafId = null;
          const snapshot = accumulated;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: snapshot } : m
            )
          );
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (firstChunk) {
            setLatency(Math.round(performance.now() - t0));
            firstChunk = false;
          }

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            accumulated += data;
          }

          if (rafId === null) {
            rafId = requestAnimationFrame(flush);
          }
        }

        if (rafId !== null) cancelAnimationFrame(rafId);
        flush();

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, isStreaming: false } : m
          )
        );
      } catch (err) {
        // AbortError = usuário clicou em Stop, não é erro real
        if (err instanceof Error && err.name === "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, isStreaming: false } : m
            )
          );
        } else {
          const message =
            err instanceof Error ? err.message : "Erro ao conectar com o servidor.";
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: message, isStreaming: false }
                : m
            )
          );
        }
      } finally {
        abortRef.current = null;
        setIsLoading(false);
      }
    },
    [isLoading, messages]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setLatency(undefined);
  }, []);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(messages, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${sessionId.current ?? "session"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [messages]);

  const isStreaming = messages.some((m) => m.isStreaming);

  return {
    messages,
    isLoading,
    isStreaming,
    latency,
    sessionId: sessionId.current ?? undefined,
    sendMessage,
    stopStreaming,
    clearHistory,
    exportJson,
  };
}
