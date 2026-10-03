import type { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { clientOrigins } from '../config/env';
import { AppError } from '../utils/AppError';

/** Defence in depth on top of SameSite cookies: state-changing requests must come from our frontend. */
export const originGuard: RequestHandler = (req, _res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin && !clientOrigins.includes(origin.toLowerCase())) {
    // Echoing the origin makes CLIENT_URL mistakes easy to spot (it is the caller's own header, not a secret).
    return next(new AppError(403, `Request origin not allowed: ${origin.slice(0, 120)}. Set CLIENT_URL on the API to this exact address.`));
  }
  next();
};

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Try again in a few minutes.' },
});
