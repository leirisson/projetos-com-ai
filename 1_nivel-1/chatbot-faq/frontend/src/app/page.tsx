"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChat } from "@/hooks/useChat";
import { useFaq } from "@/hooks/useFaq";

export default function Home() {
  const [input, setInput] = useState("");
  const { messages, isLoading, isStreaming, latency, sessionId, sendMessage, stopStreaming, clearHistory, exportJson } = useChat();
  const { placeholder } = useFaq();

  const handleSubmit = async () => {
    await sendMessage(input);
    setInput("");
  };

  return (
    <AppShell
      sessionId={sessionId}
      latency={latency}
      isStreaming={isStreaming}
      onClearHistory={clearHistory}
      onExportJson={exportJson}
    >
      <MessageList messages={messages} />
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        onStop={stopStreaming}
        isLoading={isLoading}
        placeholder={placeholder}
        latency={latency}
      />
    </AppShell>
  );
}
