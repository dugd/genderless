import csrf from 'csurf';
import type { Request, Response, NextFunction } from 'express';

export const csrfProtection = csrf({ cookie: true });

export function attachSessionId(req: Request, res: Response, next: NextFunction): void {
  req.sessionId = req.cookies['sid'];
  next();
}
