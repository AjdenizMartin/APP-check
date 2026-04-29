type RuntimeEnv = Record<string, string | undefined>;

function isTruthy(value: string | undefined) {
  return value === "1" || value === "true" || value === "yes";
}

function required(env: RuntimeEnv, key: string, errors: string[]) {
  if (!env[key] || env[key]?.trim() === "") {
    errors.push(key);
  }
}

function validateEnv(env: RuntimeEnv) {
  const missing: string[] = [];

  required(env, "DATABASE_URL", missing);

  const usesAuthSecret = Boolean(env.AUTH_SECRET && env.AUTH_SECRET.trim() !== "");
  const usesNextAuthSecret = Boolean(env.NEXTAUTH_SECRET && env.NEXTAUTH_SECRET.trim() !== "");
  if (!usesAuthSecret && !usesNextAuthSecret) {
    missing.push("AUTH_SECRET (or NEXTAUTH_SECRET)");
  }

  const sentryEnabled = isTruthy(env.SENTRY_ENABLED) || Boolean(env.SENTRY_DSN);
  if (sentryEnabled) {
    required(env, "SENTRY_DSN", missing);
  }

  const storageDriver = (env.STORAGE_DRIVER ?? "local").toLowerCase();
  if (storageDriver === "s3") {
    required(env, "S3_BUCKET", missing);
    required(env, "S3_REGION", missing);
    required(env, "S3_ACCESS_KEY_ID", missing);
    required(env, "S3_SECRET_ACCESS_KEY", missing);
  }

  if (missing.length > 0) {
    throw new Error(`Environment validation failed. Missing required variable(s): ${missing.join(", ")}`);
  }
}

let validated = false;

export function ensureEnvIsValid() {
  if (validated) return;
  validateEnv(process.env);
  validated = true;
}
