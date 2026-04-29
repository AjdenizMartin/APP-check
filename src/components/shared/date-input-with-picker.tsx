"use client";

import { CalendarDays } from "lucide-react";
import { useRef } from "react";

type DateInputWithPickerProps = {
  name: string;
  defaultValue: string;
  className?: string;
};

export function DateInputWithPicker({ name, defaultValue, className }: DateInputWithPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="date"
        name={name}
        defaultValue={defaultValue}
        className={className}
      />
      <button
        type="button"
        onClick={openPicker}
        aria-label="Open calendar"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--surface-muted)] text-[var(--foreground)] hover:border-[#8d6735] hover:text-[var(--accent)]"
      >
        <CalendarDays className="h-4 w-4" />
      </button>
    </div>
  );
}
