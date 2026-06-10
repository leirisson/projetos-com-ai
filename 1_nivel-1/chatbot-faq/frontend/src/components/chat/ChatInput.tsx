"use client";

import { useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { IconButton } from "@/components/ui/IconButton";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  latency?: number;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isLoading = false,
  placeholder = "Digite sua pergunta...",
  latency,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) onSubmit();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div
      className="shrink-0 border-t px-4 py-3"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div
        className="flex items-end gap-3 rounded-lg px-4 py-3 border transition-colors"
        style={{
          background: "var(--color-surface-2)",
          borderColor: value ? "var(--color-amber-dim)" : "var(--color-border)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed placeholder:opacity-40"
          style={{
            color: "var(--color-text)",
            fontFamily: "var(--font-syne)",
            minHeight: "24px",
            maxHeight: "160px",
          }}
        />

        {isLoading ? (
          <IconButton
            variant="outline"
            size="sm"
            onClick={onStop}
            className="shrink-0 self-end"
            style={{ borderColor: "var(--color-red)", color: "var(--color-red)" }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
              <rect x="1" y="1" width="6" height="6" rx="1" />
            </svg>
            Stop
          </IconButton>
        ) : (
          <IconButton
            variant="solid"
            size="sm"
            onClick={onSubmit}
            disabled={!value.trim()}
            className="shrink-0 self-end"
          >
            Send
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M1 5h7.5M6 2.5 8.5 5 6 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </IconButton>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-center mt-2">
        <span
          className="text-[9px] tracking-[0.2em] uppercase"
          style={{ color: "var(--color-text-dim)", fontFamily: "var(--font-mono)" }}
        >
          SYSTEM STATUS: OPTIMAL
          {latency !== undefined && ` · LATENCY: ${latency}MS`}
        </span>
      </div>
    </div>
  );
}
