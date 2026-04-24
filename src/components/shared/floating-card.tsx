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
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 md:p-8">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex min-h-full items-start justify-center py-3 md:py-6">
        <div className="w-full max-w-2xl overflow-hidden rounded-[1.7rem] border border-[var(--line)] bg-[var(--surface-elevated)] shadow-[0_28px_60px_-34px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between rounded-t-[1.7rem] border-b border-[var(--line)] bg-[var(--surface-elevated)] px-4 py-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-1 text-sm text-[var(--text-muted)] hover:bg-[#193229]"
            >
              Close
            </button>
          </div>
          <div className="max-h-[calc(100dvh-11rem)] overflow-y-auto p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
