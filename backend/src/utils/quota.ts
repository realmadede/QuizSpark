import { Redis } from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;
let redisClient: Redis | null = null;

if (REDIS_URL) {
  redisClient = new Redis(REDIS_URL);
}

// In-memory fallback if Redis is not configured (Local dev)
const memoryStore = new Map<string, { count: number; expiresAt: number }>();

export const checkQuota = async (
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> => {
  if (redisClient) {
    try {
      // Atomic check-and-increment using Lua script to prevent race conditions
      const script = `
        local current = redis.call("get", KEYS[1])
        if current and tonumber(current) >= tonumber(ARGV[1]) then
          return tonumber(current)
        end
        current = redis.call("incr", KEYS[1])
        if tonumber(current) == 1 then
          redis.call("pexpire", KEYS[1], ARGV[2])
        end
        return current
      `;
      const current = await redisClient.eval(script, 1, key, limit, windowMs);
      const count = Number(current);
      return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
    } catch (e) {
      console.error('Quota Redis error, falling back to memory', e);
    }
  }

  // Memory fallback logic (Not atomic across instances, but fine for local dev)
  const now = Date.now();
  let record = memoryStore.get(key);

  if (!record || record.expiresAt < now) {
    record = { count: 0, expiresAt: now + windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  memoryStore.set(key, record);

  // Cleanup old memory keys occasionally
  if (Math.random() < 0.05) {
    for (const [k, v] of memoryStore.entries()) {
      if (v.expiresAt < now) memoryStore.delete(k);
    }
  }

  return { allowed: true, remaining: limit - record.count };
};
