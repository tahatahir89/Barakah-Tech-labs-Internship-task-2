import { pusher, userChannel } from '../config/realtime';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

/** Pusher private-channel authorisation: a user may only subscribe to their own channel. */
export const authorizeChannel = asyncHandler(async (req, res) => {
  if (!pusher) throw new AppError(503, 'Real-time updates are not configured.');
  const { socket_id: socketId, channel_name: channel } = req.body as Record<string, string>;
  if (!socketId || channel !== userChannel(req.user!.id)) throw new AppError(403, 'Not allowed to subscribe to this channel.');
  res.json(pusher.authorizeChannel(socketId, channel));
});
