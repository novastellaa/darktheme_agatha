import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { kv } from "@vercel/kv";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.KV_REST_API_2_REST_API_TOKEN || "",
});

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(50, "1 d"),
  analytics: true,
});


export async function checkRateLimit(userId: string, feature: string) {
  if (!ratelimit) {
    console.error('Rate limiter is not initialized');
    return { success: false, limit: 0, reset: 0, remaining: 0 };
  }

  try {
    const { success, limit: rateLimit, reset, remaining } = await ratelimit.limit(`${feature}_ratelimit_${userId}`);
    return { success, limit: rateLimit, reset, remaining };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return { success: false, limit: 0, reset: 0, remaining: 0 };
  }
}

export async function logRateLimitedRequest(userId: string, username: string, feature: string) {
  // Implementation for logging rate-limited requests
  // This can be added later when you have a proper logging mechanism
  console.log(`Rate limited request: ${userId}, ${username}, ${feature}`);
}