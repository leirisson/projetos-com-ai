"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { IconButton } from "@/components/ui/IconButton";

interface AppShellProps {
  children: React.ReactNode;
  sessionId?: string;
  instanceInfo?: string;
  latency?: number;
  isStreaming?: boolean;
  onClearHistory?: () => void;
  onExportJson?: () => void;
}

const NAV_ITEMS = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="5" height="5" rx="1" />
        <rect x="8" y="1" width="5" height="5" rx="1" />
        <rect x="1" y="8" width="5" height="5" rx="1" />
        <rect x="8" y="8" width="5" height="5" rx="1" />
      </svg>
    ),
  },
  {
    id: "chat",
    label: "Chat Demo",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H8l-2 2-2-2H3a1 1 0 0 1-1-1V3z" />
      </svg>
    ),
  },
  {
    id: "api-docs",
    label: "API Docs",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 2h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
        <path d="M4 5h6M4 7h4M4 9h5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const TOP_NAV = ["Analytics", "Logs", "Deploy"];

export function AppShell({
  children,
  sessionId,
  instanceInfo,
  latency,
  isStreaming = false,
  onClearHistory,
  onExportJson,
}: AppShellProps) {
  const [activeNav, setActiveNav] = useState("chat");

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      <Sidebar
        navItems={NAV_ITEMS}
        activeItem={activeNav}
        onNavigate={setActiveNav}
        onNewChat={() => {}}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 h-12 shrink-0 border-b"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center gap-6">
            <h1
              className="text-base font-bold"
              style={{ color: "var(--color-text)", fontFamily: "var(--font-syne)" }}
            >
              FAQ Chatbot Engine
            </h1>
            <nav className="flex items-center gap-1">
              {TOP_NAV.map((item) => (
                <button
                  key={item}
                  className="text-xs px-3 py-1 rounded transition-colors cursor-pointer"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-text-muted)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--color-text)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--color-text-muted)")
                  }
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>

          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: "var(--color-amber)",
              color: "#0d0f12",
              fontFamily: "var(--font-mono)",
            }}
          >
            U
          </div>
        </header>

        {/* Chat header */}
        <div
          className="flex items-center justify-between px-6 py-3 border-b shrink-0"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border-subtle)",
          }}
        >
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <StatusBadge
                status={isStreaming ? "streaming" : "online"}
                label={sessionId ? `Bot Session: ${sessionId}` : "Bot Session"}
              />
            </div>
            {instanceInfo && (
              <span
                className="text-[10px]"
                style={{
                  color: "var(--color-text-dim)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Active Instance: {instanceInfo}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <IconButton variant="ghost" size="sm" onClick={onClearHistory}>
              Clear History
            </IconButton>
            <IconButton variant="outline" size="sm" onClick={onExportJson}>
              Export JSON
            </IconButton>
            {latency !== undefined && (
              <span
                className="text-[10px] ml-2"
                style={{
                  color: "var(--color-text-dim)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                LATENCY · {latency}ms
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
      </div>
    </div>
  );
}
