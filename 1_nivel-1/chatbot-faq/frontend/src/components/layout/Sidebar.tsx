"use client";

import { IconButton } from "@/components/ui/IconButton";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  navItems: NavItem[];
  activeItem: string;
  onNavigate: (id: string) => void;
  onNewChat: () => void;
}

export function Sidebar({ navItems, activeItem, onNavigate, onNewChat }: SidebarProps) {
  return (
    <aside
      className="flex flex-col h-full w-[168px] shrink-0 border-r"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Logo */}
      <div
        className="flex flex-col gap-0.5 px-4 pt-5 pb-4 border-b"
        style={{ borderColor: "var(--color-border-subtle)" }}
      >
        <div
          className="w-8 h-8 rounded flex items-center justify-center mb-2"
          style={{ background: "var(--color-amber)", color: "#0d0f12" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3zm0 5a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h8a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1z" />
          </svg>
        </div>
        <span
          className="text-sm font-bold leading-tight"
          style={{ color: "var(--color-text)", fontFamily: "var(--font-syne)" }}
        >
          FAQ
        </span>
        <span
          className="text-sm font-bold leading-tight"
          style={{ color: "var(--color-text)" }}
        >
          Dashboard
        </span>
        <span
          className="text-[10px] mt-0.5 font-medium uppercase tracking-widest"
          style={{ color: "var(--color-amber)", fontFamily: "var(--font-mono)" }}
        >
          Technical Auth.
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = item.id === activeItem;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex items-center gap-2.5 px-3 py-2 rounded text-sm w-full text-left transition-all duration-150 cursor-pointer"
              style={{
                fontFamily: "var(--font-syne)",
                background: isActive ? "var(--color-amber-glow)" : "transparent",
                color: isActive ? "var(--color-amber)" : "var(--color-text-muted)",
                borderLeft: isActive
                  ? "2px solid var(--color-amber)"
                  : "2px solid transparent",
              }}
            >
              <span className="shrink-0 opacity-70">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* New Chat */}
      <div className="p-3 border-t" style={{ borderColor: "var(--color-border-subtle)" }}>
        <IconButton
          variant="solid"
          size="sm"
          onClick={onNewChat}
          className="w-full justify-start"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          New Experiment
        </IconButton>

        {/* Footer links */}
        <div className="mt-3 flex flex-col gap-1">
          {[
            { label: "Settings", icon: "⚙" },
            { label: "Support", icon: "?" },
          ].map((link) => (
            <button
              key={link.label}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors cursor-pointer w-full"
              style={{
                fontFamily: "var(--font-syne)",
                color: "var(--color-text-muted)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-text)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-text-muted)")
              }
            >
              <span className="text-[10px]">{link.icon}</span>
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
