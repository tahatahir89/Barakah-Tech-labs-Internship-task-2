import bcrypt from 'bcryptjs';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { deleteImage, uploadImage } from '../services/upload.service';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { toUser } from '../utils/serializers';

export const getMe = asyncHandler(async (req, res) => {
  const u = req.user!;
  const [total, completed] = await Promise.all([
    Task.countDocuments({ user: u._id }),
    Task.countDocuments({ user: u._id, status: 'Completed' }),
  ]);
  res.json({ user: toUser(u), stats: { total, completed, pending: total - completed } });
});

export const updateMe = asyncHandler(async (req, res) => {
  const u = req.user!;
  const { name, username, email } = req.body as { name?: string; username?: string; email?: string };

  const conditions: Record<string, string>[] = [];
  if (username && username !== u.username) conditions.push({ username });
  if (email && email !== u.email) conditions.push({ email });
  if (conditions.length) {
    const clash = await User.findOne({ _id: { $ne: u._id }, $or: conditions });
    if (clash) throw new AppError(409, clash.email === email ? 'That email is already in use.' : 'That username is taken.');
  }

  if (name) u.name = name;
  if (username) u.username = username;
  if (email) u.email = email;
  await u.save();
  res.json({ user: toUser(u) });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body as Record<string, string>;
  const user = await User.findById(req.user!._id).select('+password');
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    throw new AppError(400, 'Your current password is incorrect.', { currentPassword: ['Incorrect password'] });
  }
  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ message: 'Password updated' });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError(400, 'Choose an image to upload.');
  const u = req.user!;
  const result = await uploadImage(req.file.buffer, `${u.id}/avatar`, 512);
  await deleteImage(u.profileImage?.publicId);
  u.profileImage = { url: result.secure_url, publicId: result.public_id };
  await u.save();
  res.json({ user: toUser(u) });
});

export const removeAvatar = asyncHandler(async (req, res) => {
  const u = req.user!;
  await deleteImage(u.profileImage?.publicId);
  u.profileImage = { url: undefined, publicId: undefined };
  await u.save();
  res.json({ user: toUser(u) });
});

/** requireAuth already refreshed lastActive; this endpoint lets an idle-but-open tab say "still here". */
export const heartbeat = asyncHandler(async (_req, res) => {
  res.status(204).end();
});
