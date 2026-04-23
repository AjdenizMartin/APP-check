import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-24 w-full rounded-md border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--foreground)] ring-offset-[var(--surface)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
