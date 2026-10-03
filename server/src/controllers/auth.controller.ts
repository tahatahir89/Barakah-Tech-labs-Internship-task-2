import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { toUser } from '../utils/serializers';
import { AUTH_COOKIE, clearAuthCookie, setAuthCookie } from '../utils/token';

export const register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body as Record<string, string>;
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw new AppError(409, existing.email === email ? 'An account with this email already exists.' : 'That username is taken.');
  }
  const user = await User.create({
    name,
    username,
    email,
    password: await bcrypt.hash(password, 12),
    status: 'active',
    lastActive: new Date(),
  });
  setAuthCookie(res, user.id);
  res.status(201).json({ user: toUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as Record<string, string>;
  const user = await User.findOne({ email }).select('+password');
  const valid = user ? await bcrypt.compare(password, user.password) : false;
  if (!user || !valid) throw new AppError(401, 'Invalid email or password.');

  user.status = 'active';
  user.lastActive = new Date();
  await user.save();
  setAuthCookie(res, user.id);
  res.json({ user: toUser(user) });
});

export const logout = asyncHandler(async (req, res) => {
  const token: unknown = req.signedCookies?.[AUTH_COOKIE];
  if (typeof token === 'string') {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      await User.updateOne({ _id: payload.sub }, { status: 'offline' });
    } catch {
      // Expired/invalid token: nothing to update, the cookie is cleared below regardless.
    }
  }
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: toUser(req.user!) });
});
