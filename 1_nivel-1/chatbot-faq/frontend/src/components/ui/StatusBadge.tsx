"use client";

type Status = "online" | "offline" | "streaming";

interface StatusBadgeProps {
  status: Status;
  label?: string;
  latency?: number;
}

const statusConfig: Record<Status, { color: string; label: string }> = {
  online:    { color: "var(--color-green)", label: "Online" },
  offline:   { color: "var(--color-red)",   label: "Offline" },
  streaming: { color: "var(--color-amber)",  label: "Streaming" },
};

export function StatusBadge({ status, label, latency }: StatusBadgeProps) {
  const { color, label: defaultLabel } = statusConfig[status];

  return (
    <div
      className="flex items-center gap-2 text-xs"
      style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full animate-pulse-dot"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
      />
      <span style={{ color: "var(--color-text-muted)" }}>
        {label ?? defaultLabel}
        {latency !== undefined && (
          <span style={{ color: "var(--color-text-dim)" }}> · {latency}ms</span>
        )}
      </span>
    </div>
  );
}
