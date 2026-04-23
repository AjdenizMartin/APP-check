const dateTimeFormatter = new Intl.DateTimeFormat("en-IE", {
  dateStyle: "medium",
  timeStyle: "short",
});

const timeFormatter = new Intl.DateTimeFormat("en-IE", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "-";
  return dateTimeFormatter.format(new Date(value));
}

export function formatTime(value: Date | string | null | undefined) {
  if (!value) return "-";
  return timeFormatter.format(new Date(value));
}

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
