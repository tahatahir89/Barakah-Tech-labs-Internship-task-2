import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

/** Validates + sanitises req.body (default) or req.query (exposed as res.locals.query). */
export const validate =
  (schema: ZodTypeAny, source: 'body' | 'query' = 'body'): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(source === 'body' ? req.body : req.query);
    if (!result.success) return next(result.error);
    if (source === 'body') req.body = result.data;
    else res.locals.query = result.data;
    next();
  };
