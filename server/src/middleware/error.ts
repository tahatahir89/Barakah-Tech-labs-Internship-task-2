import type { ErrorRequestHandler, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import multer from 'multer';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl.split('?')[0]}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let status = 500;
  let message = 'Something went wrong on our side. Please try again.';
  let details: Record<string, string[] | undefined> | undefined;

  if (err instanceof AppError) {
    status = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    status = 400;
    message = 'Please check the highlighted fields.';
    details = err.flatten().fieldErrors;
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = 'Invalid identifier.';
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = 'Some values are invalid.';
  } else if ((err as { code?: number }).code === 11000) {
    status = 409;
    const key = Object.keys((err as { keyPattern?: Record<string, unknown> }).keyPattern ?? {})[0];
    message = key ? `That ${key} is already in use.` : 'That value is already in use.';
  } else if (err instanceof jwt.JsonWebTokenError) {
    status = 401;
    message = 'Your session has expired. Please log in again.';
  } else if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Image is too large (max 4 MB).' : 'Upload failed. Please try another image.';
  }

  if (status >= 500) console.error(err); // never leaked to the client
  res.status(status).json({ message, ...(details ? { details } : {}) });
};
