"use client";

import ReactMarkdown from "react-markdown";
import { StreamingIndicator } from "./StreamingIndicator";

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp?: string;
  isStreaming?: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

function formatTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin === 1) return "1 min ago";
  return `${diffMin} min ago`;
}

function AssistantLabel({ timestamp }: { timestamp?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <div
        className="w-4 h-4 rounded-sm flex items-center justify-center"
        style={{ background: "var(--color-amber)", opacity: 0.9 }}
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="#0d0f12">
          <circle cx="4" cy="4" r="3" />
        </svg>
      </div>
      <span
        className="text-[11px]"
        style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
      >
        Assistant
        {timestamp && (
          <span style={{ color: "var(--color-text-dim)" }}>
            {" · "}{formatTime(timestamp)}
          </span>
        )}
      </span>
    </div>
  );
}

function UserLabel({ timestamp }: { timestamp?: string }) {
  return (
    <div className="flex items-center justify-end gap-1.5 mb-2">
      <span
        className="text-[11px]"
        style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
      >
        You
        {timestamp && (
          <span style={{ color: "var(--color-text-dim)" }}>
            {" · "}{formatTime(timestamp)}
          </span>
        )}
      </span>
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <circle
          cx="5.5"
          cy="5.5"
          r="4.5"
          stroke="var(--color-text-dim)"
          strokeWidth="1"
        />
        <path
          d="M5.5 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-2.5 3c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5"
          fill="var(--color-text-dim)"
        />
      </svg>
    </div>
  );
}

const mdComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => <strong className="font-semibold" style={{ color: "var(--color-text)" }}>{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => (
    <code className="px-1 py-0.5 rounded text-[11px]" style={{ background: "var(--color-border)", fontFamily: "var(--font-mono)" }}>
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="p-3 rounded text-xs overflow-x-auto mb-2" style={{ background: "var(--color-border)", fontFamily: "var(--font-mono)" }}>
      {children}
    </pre>
  ),
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex flex-col items-end animate-fade-slide-up">
        <UserLabel timestamp={message.timestamp} />
        <div
          className="max-w-[72%] rounded-lg px-4 py-3 text-sm leading-relaxed"
          style={{
            background: "var(--color-user-bubble)",
            border: "1px solid var(--color-user-border)",
            color: "var(--color-text)",
            fontFamily: "var(--font-syne)",
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start animate-fade-slide-up">
      <AssistantLabel timestamp={message.timestamp} />
      <div
        className="max-w-[82%] rounded-lg px-4 py-3 text-sm leading-relaxed"
        style={{
          background: "var(--color-assistant-bubble)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)",
          fontFamily: "var(--font-syne)",
          willChange: message.isStreaming ? "contents" : "auto",
        }}
      >
        {message.content ? (
          <div className={`streaming-content${message.isStreaming ? " is-streaming cursor-blink" : ""}`}>
            <ReactMarkdown components={mdComponents}>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <span style={{ color: "var(--color-text-dim)" }}>
            Searching internal documentation...
          </span>
        )}
      </div>
      {message.isStreaming && (
        <div className="mt-2">
          <StreamingIndicator />
        </div>
      )}
    </div>
  );
}
