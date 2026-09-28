import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Redis } from 'ioredis';
import { Request } from 'express';

const REDIS_URL = process.env.REDIS_URL;
let redisClient: Redis | null = null;

if (process.env.NODE_ENV === 'production') {
  if (!REDIS_URL) {
    console.warn('WARNING: REDIS_URL not set in production. Falling back to memory store.');
  } else {
    redisClient = new Redis(REDIS_URL);
    redisClient.on('error', (err) => console.error('Redis Rate Limit Error:', err));
  }
} else if (REDIS_URL) {
  redisClient = new Redis(REDIS_URL);
  redisClient.on('error', (err) => console.error('Redis Rate Limit Error (Dev):', err));
}

const createLimiter = (options: any) => {
  if (redisClient) {
    options.store = new RedisStore({
      sendCommand: (...args: string[]) => redisClient!.call(args[0], ...args.slice(1)) as any,
    });
  }

  const defaultHandler = options.handler;
  options.handler = (req: Request, res: any, next: any, options: any) => {
    console.warn(`RATE LIMIT EXCEEDED | Route: ${req.originalUrl} | Max: ${options.max}`);
    if (defaultHandler) {
      return defaultHandler(req, res, next, options);
    }
    return res
      .status(options.statusCode || 429)
      .json({ error: options.message?.error || 'Too many requests, please try again later.' });
  };

  return rateLimit(options);
};

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, please try again later.' },
});

export const tokenLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many token requests, please try again later.' },
});

export const accountApiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many API requests for this account.' },
  // use req.headers['x-forwarded-for'] or remoteAddress, ignoring .ip for the regex check
  keyGenerator: (req: Request) =>
    req.user?.userId || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
});

export const searchLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many searches. Slow down.' },
});

export const gameActionLimiter = createLimiter({
  windowMs: 10 * 1000,
  max: 20,
  message: { error: 'Too many game actions.' },
});
