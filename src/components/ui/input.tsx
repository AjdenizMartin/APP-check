import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--foreground)] ring-offset-[var(--surface)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
