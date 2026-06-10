"use client";

import { ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "solid" | "outline";
  size?: "sm" | "md";
}

const variantStyles: Record<string, string> = {
  ghost:   "hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
  solid:   "bg-[var(--color-amber)] text-[#0d0f12] hover:bg-[var(--color-amber-dim)] font-medium",
  outline: "border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-amber)] hover:text-[var(--color-amber)]",
};

const sizeStyles: Record<string, string> = {
  sm: "h-7 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
};

export function IconButton({
  variant = "ghost",
  size = "md",
  children,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded cursor-pointer
        transition-all duration-150 select-none
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}
      `}
      style={{ fontFamily: "var(--font-mono)" }}
      {...props}
    >
      {children}
    </button>
  );
}
