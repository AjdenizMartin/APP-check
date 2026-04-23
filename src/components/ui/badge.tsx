import { cn } from "@/lib/utils";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-[#7b6037] bg-[rgba(181,138,82,0.2)] px-2.5 py-1 text-xs font-semibold tracking-wide text-[#e7cda8]",
        className,
      )}
    >
      {children}
    </span>
  );
}
