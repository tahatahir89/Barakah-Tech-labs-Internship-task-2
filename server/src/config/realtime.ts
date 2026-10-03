import Pusher from 'pusher';
import { env } from './env';

const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = env;

/**
 * Vercel serverless functions cannot hold WebSocket connections, so real-time
 * is delivered through Pusher Channels. Without credentials it is simply off.
 */
export const pusher =
  PUSHER_APP_ID && PUSHER_KEY && PUSHER_SECRET && PUSHER_CLUSTER
    ? new Pusher({ appId: PUSHER_APP_ID, key: PUSHER_KEY, secret: PUSHER_SECRET, cluster: PUSHER_CLUSTER, useTLS: true })
    : null;

export const userChannel = (userId: string) => `private-user-${userId}`;

/** Must be awaited in handlers: serverless functions freeze once the response is sent. */
export async function emitToUser(userId: string, event: string, payload: Record<string, unknown> = {}) {
  if (!pusher) return;
  try {
    await pusher.trigger(userChannel(userId), event, payload);
  } catch (err) {
    console.error('Realtime trigger failed:', (err as Error).message);
  }
}
