type LogPayload = Record<string, unknown>;

function format(level: string, message: string, payload?: LogPayload) {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...payload,
  };
}

function output(level: "info" | "warn" | "error", message: string, payload?: LogPayload) {
  const line = JSON.stringify(format(level, message, payload));
  if (level === "info") console.info(line);
  if (level === "warn") console.warn(line);
  if (level === "error") console.error(line);
}

export function generateRequestId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const logger = {
  info(message: string, payload?: LogPayload) {
    output("info", message, payload);
  },
  warn(message: string, payload?: LogPayload) {
    output("warn", message, payload);
  },
  error(message: string, payload?: LogPayload) {
    output("error", message, payload);
  },
};
