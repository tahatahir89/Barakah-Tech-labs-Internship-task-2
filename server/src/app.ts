import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { clientOrigins, env } from './config/env';
import { connectDB } from './config/db';
import { errorHandler, notFound } from './middleware/error';
import { apiLimiter, originGuard } from './middleware/security';
import routes from './routes';
import { AppError } from './utils/AppError';
import { asyncHandler } from './utils/asyncHandler';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) =>
      !origin || clientOrigins.includes(origin.toLowerCase())
        ? cb(null, true)
        : cb(new AppError(403, `Request origin not allowed: ${origin.slice(0, 120)}. Set CLIENT_URL on the API to this exact address.`)),
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser(env.COOKIE_SECRET));
app.use(originGuard);
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', apiLimiter);
app.use(
  '/api',
  asyncHandler(async (_req, _res, next) => {
    await connectDB();
    next();
  }),
);
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
