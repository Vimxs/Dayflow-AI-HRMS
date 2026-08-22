/**
 * Dayflow HRMS — In-Memory Rate Limiter
 * Security Doc §1: Max 5 attempts per 15 minutes per IP + key (email)
 *
 * // ASSUMPTION / DEV STUB:
 * This is an in-memory sliding window rate limiter suitable for single-instance / local dev.
 * BEFORE PRODUCTION DEPLOY: Must be replaced with a distributed store (e.g. Redis / Upstash),
 * because serverless deployment (Vercel) will not share in-memory state across function instances.
 * Logged in memory.md.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const cache = new Map<string, RateLimitRecord>();

// Clean up expired entries every 10 minutes to avoid memory leaks in dev
setInterval(() => {
  const now = Date.now();
  const fifteenMinutesAgo = now - 15 * 60 * 1000;
  for (const [key, record] of cache.entries()) {
    const validTimestamps = record.timestamps.filter((t) => t > fifteenMinutesAgo);
    if (validTimestamps.length === 0) {
      cache.delete(key);
    } else {
      cache.set(key, { timestamps: validTimestamps });
    }
  }
}, 10 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Enforces rate limit on a key (e.g. "signup:127.0.0.1:user@example.com").
 * @param key Identifier for rate limiting
 * @param limit Maximum allowed attempts within window (default 5)
 * @param windowMs Window duration in milliseconds (default 15 minutes)
 */
export function checkRateLimit(
  key: string,
  limit = 5,
  windowMs = 15 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const record = cache.get(key) || { timestamps: [] };
  const validTimestamps = record.timestamps.filter((t) => t > windowStart);

  if (validTimestamps.length >= limit) {
    const oldestTimestamp = validTimestamps[0];
    const resetInSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      resetInSeconds: Math.max(resetInSeconds, 1),
    };
  }

  validTimestamps.push(now);
  cache.set(key, { timestamps: validTimestamps });

  return {
    success: true,
    limit,
    remaining: limit - validTimestamps.length,
    resetInSeconds: Math.ceil(windowMs / 1000),
  };
}
