import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { User, UserDoc } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { AUTH_COOKIE } from '../utils/token';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserDoc;
    }
  }
}

const TOUCH_AFTER_MS = 60_000;

/** Verifies the signed HTTP-only cookie, loads the user and refreshes activity (at most once a minute). */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token: unknown = req.signedCookies?.[AUTH_COOKIE];
  if (typeof token !== 'string') throw new AppError(401, 'Please log in to continue.');

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    throw new AppError(401, 'Your session has expired. Please log in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new AppError(401, 'Account not found. Please log in again.');

  if (user.status !== 'active' || Date.now() - user.lastActive.getTime() > TOUCH_AFTER_MS) {
    const now = new Date();
    await User.updateOne({ _id: user._id }, { status: 'active', lastActive: now });
    user.status = 'active';
    user.lastActive = now;
  }

  req.user = user;
  next();
});
