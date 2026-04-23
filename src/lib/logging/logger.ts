type LogPayload = Record<string, unknown>;

function format(level: string, message: string, payload?: LogPayload) {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...payload,
  };
}

export const logger = {
  info(message: string, payload?: LogPayload) {
    console.info(format("info", message, payload));
  },
  warn(message: string, payload?: LogPayload) {
    console.warn(format("warn", message, payload));
  },
  error(message: string, payload?: LogPayload) {
    console.error(format("error", message, payload));
  },
};
