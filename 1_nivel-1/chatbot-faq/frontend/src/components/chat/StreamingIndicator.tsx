"use client";

export function StreamingIndicator() {
  return (
    <div className="flex items-center gap-2 px-1">
      <span
        className="inline-block w-1.5 h-1.5 rounded-full animate-pulse-dot"
        style={{
          backgroundColor: "var(--color-amber)",
          boxShadow: "0 0 6px var(--color-amber)",
          animationDelay: "0ms",
        }}
      />
      <span
        className="inline-block w-1.5 h-1.5 rounded-full animate-pulse-dot"
        style={{
          backgroundColor: "var(--color-amber)",
          opacity: 0.7,
          animationDelay: "200ms",
        }}
      />
      <span
        className="inline-block w-1.5 h-1.5 rounded-full animate-pulse-dot"
        style={{
          backgroundColor: "var(--color-amber)",
          opacity: 0.4,
          animationDelay: "400ms",
        }}
      />
      <span
        className="text-[11px] ml-1"
        style={{
          color: "var(--color-amber)",
          fontFamily: "var(--font-mono)",
        }}
      >
        Streaming further details...
      </span>
    </div>
  );
}
