import { ReactNode } from "react";

export function FloatingCard({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-[var(--line)] bg-[var(--surface-elevated)] shadow-[0_24px_50px_-30px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between border-b border-[var(--line)] p-4">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-1 text-sm text-[var(--text-muted)] hover:bg-[#193229]"
          >
            Close
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
