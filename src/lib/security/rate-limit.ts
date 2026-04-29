type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function now() {
  return Date.now();
}

function pruneExpired() {
  const current = now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= current) {
      buckets.delete(key);
    }
  }
}

export function checkRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  pruneExpired();

  const current = now();
  const existing = buckets.get(input.key);
  if (!existing || existing.resetAt <= current) {
    buckets.set(input.key, {
      count: 1,
      resetAt: current + input.windowMs,
    });

    return {
      ok: true,
      remaining: input.limit - 1,
      resetAt: current + input.windowMs,
    };
  }

  if (existing.count >= input.limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  buckets.set(input.key, existing);

  return {
    ok: true,
    remaining: input.limit - existing.count,
    resetAt: existing.resetAt,
  };
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}
