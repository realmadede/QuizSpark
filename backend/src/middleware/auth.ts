import { Request, Response, NextFunction } from 'express';
import { extractToken, verifyToken, JWTPayload } from '../utils/jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

import { prisma } from '../prisma';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token || extractToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Ensure the user actually exists in the database and token version matches
  const user = await prisma.profile.findUnique({
    where: { id: payload.userId },
    select: { id: true, tokenVersion: true },
  });

  if (!user || user.tokenVersion !== payload.tokenVersion) {
    return res.status(401).json({ error: 'Session invalidated or user deleted' });
  }

  req.user = payload;
  next();
}

export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.token || extractToken(req.headers.authorization);

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
}
